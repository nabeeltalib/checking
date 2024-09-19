import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from "@/lib/appwrite/api";

import { account, databases, Query, ID } from "@/lib/appwrite/config";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_GOOGLE_COLLECTION_ID;

const AuthCallback = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
     

     
        // Get user information
        const accountInfo = await account.get();
        console.log(accountInfo)
        const currentAccount = await getCurrentUser();

        const userEmail = accountInfo.email;
        
        // Check if user exists
        let existingUser = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal('email', userEmail)]
        );

        if (existingUser.total === 0) {
          // User does not exist, create a new document
          try {
            await databases.createDocument(
              DATABASE_ID,
              COLLECTION_ID,
              ID.unique(),
              {
                accountId: accountInfo.$id,
                email: userEmail,
                name: accountInfo.name,
                bio: "",
                Username: accountInfo.name,
                isFirstTimeLogin: true,
              }
            );
            navigate( `/update-profile/${currentAccount.$id}`);
          } catch (error) {
            if (error.code === 409) { // Conflict error (e.g., unique constraint violation)
              // Re-fetch the document
              existingUser = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [Query.equal('email', userEmail)]
              );
              const userDoc = existingUser.documents[0];
              const isFirstTimeLogin = userDoc.isFirstTimeLogin;

              if (isFirstTimeLogin) {
                try {
                  await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTION_ID,
                    userDoc.$id,
                    { isFirstTimeLogin: false }
                  );
                } catch (updateError) {
                  console.error("Error updating document:", updateError.message);
                  navigate('/error');
                }
              } else {
              }
              navigate(isFirstTimeLogin ?  `/update-profile/${currentAccount.$id}` : '/');
            } else {
              console.error("Error creating document:", error.message);
              navigate('/error');
            }
          }
        } else {
          // User exists, check if it's their first login
          const userDoc = existingUser.documents[0];
          const isFirstTimeLogin = userDoc.isFirstTimeLogin;

          if (isFirstTimeLogin) {
            try {
              await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                userDoc.$id,
                { isFirstTimeLogin: false }
              );
            } catch (updateError) {
              console.error("Error updating document:", updateError.message);
              navigate('/error');
            }
          } else {
          }
          navigate(isFirstTimeLogin ?  `/update-profile/${currentAccount.$id}` : '/');
        }
      } catch (error) {
        console.error("Error in Auth Callback:", error.message);
        navigate('/error');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return <div>Loading...</div>;
};

export default AuthCallback;