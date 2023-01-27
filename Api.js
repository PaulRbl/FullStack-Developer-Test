// Import the necessary modules
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull
} = require('graphql');

// Create a task array to store our task resources
const tasks = [
  { id: '1', title: 'Task 1', description: 'This is task 1', status: 'In Progress' },
  { id: '2', title: 'Task 2', description: 'This is task 2', status: 'Completed' },
  { id: '3', title: 'Task 3', description: 'This is task 3', status: 'In Progress' },
];

// Create a TaskType to define the shape of a task resource
const TaskType = new GraphQLObjectType({
  name: 'Task',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
  })
});

// Create the Query type for fetching data
const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    tasks: {            // used to return all tasks at once
      type: new GraphQLList(TaskType),
      resolve: () => tasks,
    },
    task: {             // used to return a selected task
      type: TaskType,
      args: {
        id: { type: GraphQLID },
      },
      resolve: (_, { id }) => tasks.find(task => task.id === id),  // we use the id to select it
    },
  },
});

// Create the Mutation type for modifying data
const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addTask: {   // used to add a new task, no need to specify id
      type: TaskType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
        status: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, { title, description, status }) => {
        const newTask = { id: String(tasks.length + 1), title, description, status };  // id is incremented with tasks size
        tasks.push(newTask);
        return newTask;
      },
    },
    updateTask: {  // used to update a task
      type: TaskType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: GraphQLString },
      },
      resolve: (_, { id, title, description, status }) => {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex < 0) {         // we test if the task exists by checking the index
          throw new Error(`Task with id ${id} not found`);
        }
        if(title == null){     // if no title specified we use the exiting one
          title = tasks[taskIndex]['title'];
        }
        if(description == null){       // if no description specified we use the exiting one
          description = tasks[taskIndex]['description'];
        }
        if(status == null){     // if no status specified we use the exiting one
          status = tasks[taskIndex]['status'];
        }
        tasks[taskIndex] = { ...tasks[taskIndex], title, description, status };  // here the task is modified
        return tasks[taskIndex];
      },
    },
    deleteTask: {   // used to delete a task with the index only
      type: TaskType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        },
      resolve: (_, { id }) => {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex < 0) {   // we test if the task exists by checking the index
        throw new Error('Task with id ${id} not found');
        }
        const deletedTask = tasks[taskIndex];
        tasks.splice(taskIndex, 1);
        return deletedTask;
      },
    },
    },
});

// Create the schema
const schema = new GraphQLSchema({
    query: QueryType,
    mutation: MutationType,
});
    
// Create the Express server
const app = express();
    
// Add the GraphQL endpoint
app.use('/graphql', graphqlHTTP({
schema,
graphiql: true,
}));
    
// Start the server
app.listen(3000, () => {
console.log('Server running on http://localhost:3000/graphql');
});