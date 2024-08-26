import { functions, appwriteConfig } from '@/lib/appwrite/config';

export async function createTypesenseSchema() {
  try {
    await functions.createExecution(
      appwriteConfig.typesenseOperationsFunctionId,
      JSON.stringify({ operation: 'createSchema' }),
      false
    );

    console.log('Typesense schema created successfully');
  } catch (error) {
    console.error('Error creating Typesense schema:', error);
  }
}
