// createTypesenseSchema.ts
import { functions } from './appwrite/config';
import { appwriteConfig } from './appwrite/config';

export async function createTypesenseSchema() {
  const schema = {
    name: 'lists',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'items', type: 'string[]' },
      { name: 'tags', type: 'string[]' },
      { name: 'creator', type: 'string' },
      { name: 'created_at', type: 'int64' }
    ],
    default_sorting_field: 'created_at'
  };

  try {
    await functions.createExecution(
      appwriteConfig.typesenseOperationsFunctionId,
      JSON.stringify({ operation: 'createSchema', data: { schema } }),
      false
    );
    console.log('Typesense schema created successfully');
  } catch (error) {
    console.error('Error creating Typesense schema:', error);
  }
}