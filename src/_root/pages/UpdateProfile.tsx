import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Textarea, Input, Button } from "@/components/ui";
import { ProfileUploader, Loader } from "@/components/shared";

import { ProfileValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById, useUpdateUser } from "@/lib/react-query/queries";

const UpdateProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, setUser } = useUserContext();
  
  const form = useForm<z.infer<typeof z.any>>({
    resolver: zodResolver(ProfileValidation),
    defaultValues: {
      file: [],
      Name: user.Name,
      Username: user.Username,
      Email: user.Email,
      Bio: user.Bio || "",
    },
  });

  const { data: currentUser, isLoading: isLoadingUser } = useGetUserById(id || "");
  const { mutateAsync: updateUser, isLoading: isLoadingUpdate } = useUpdateUser();

  useEffect(() => {
    if (currentUser) {
      form.reset({
        file: [],
        Name: currentUser.Name,
        Username: currentUser.Username,
        Email: currentUser.Email,
        Bio: currentUser.Bio || "",
      });
    }
  }, [currentUser, form]);

  const handleUpdate = useCallback(
    async (value: z.infer<typeof z.any>) => {
      try {
        const updatedUser = await updateUser({
          userId: currentUser.$id,
          Name: value.name,
          Bio: value.bio,
          file: value.file,
          ImageUrl: currentUser.ImageUrl,
          imageId: currentUser.imageId,
        });

        if (!updatedUser) {
          throw new Error('Update user failed. Please try again.');
        }

        setUser({
          ...user,
          Name: updatedUser.Name,
          Bio: updatedUser.Bio,
          ImageUrl: updatedUser.ImageUrl,
        });
        navigate(`/profile/${id}`);
      } catch (error) {
        toast({ title: error.message });
      }
    },
    [currentUser, updateUser, setUser, user, navigate, toast, id]
  );

  if (isLoadingUser) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex-center w-full h-full">
        <p>User not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Profile</h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="flex flex-col gap-7 w-full mt-4 max-w-5xl"
          >
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem className="flex">
                  <FormControl>
                    <ProfileUploader
                      fieldChange={field.onChange}
                      mediaUrl={currentUser.imageUrl}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      aria-label="Name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      disabled
                      aria-label="Username"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      disabled
                      aria-label="Email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      className="shad-textarea custom-scrollbar"
                      {...field}
                      aria-label="Bio"
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <div className="flex gap-4 items-center justify-end">
              <Button
                type="button"
                className="shad-button_dark_4"
                onClick={() => navigate(-1)}
                aria-label="Cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="shad-button_primary whitespace-nowrap"
                disabled={isLoadingUpdate}
                aria-label="Update Profile"
              >
                {isLoadingUpdate && <Loader />}
                Update Profile
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateProfile;