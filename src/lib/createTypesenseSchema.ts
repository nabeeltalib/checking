// createTypesenseSchema.ts
import { functions } from './appwrite/config';
import { appwriteConfig } from './appwrite/config';

export async function createTypesenseSchema() {
  try {
    await functions.createExecution(
      appwriteConfig.typesenseOperationsFunctionId,
      JSON.stringify({ operation: 'createSchema'}),
      false
    );
    
    console.log('Typesense schema created successfully');
  } catch (error) {
    console.error('Error creating Typesense schema:', error);
  }
}