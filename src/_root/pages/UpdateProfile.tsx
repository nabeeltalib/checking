import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Textarea, Input, Button } from "@/components/ui";
import { ProfileUploader, Loader } from "@/components/shared";

import { useUserContext } from "@/context/AuthContext";
import { useGetUserById, useUpdateUser } from "@/lib/react-query/queries";

const formSchema = z.object({
  Name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  Username: z
    .string()
    .max(100, "Username must be less than 100 characters"),
  Email: z
    .string()
    .max(100, "Email must be less than 100 characters"),
  Bio: z
    .string()
    .max(500, "Bio must be less than 500 characters"),
  ImageUrl: z
    .string()
    .max(256, "Image Url must be less than 256 characters")
    .optional(),
  accountId: z
    .string()
    .max(100, "accountId must be less than 100 characters"),
  file: z.instanceof(File).optional(),
  Public: z.boolean()
});

const UpdateProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, setUser } = useUserContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
      Name: user.Name || "",
      Username: user.Username || "",
      Email: user.Email || "",
      Bio: user.Bio || "",
      ImageUrl: user.imageUrl || "",
      accountId: user.id || "",
      Public: user.Public || true,
    },
  });

  const { data: currentUser, isLoading: isLoadingUser } = useGetUserById(id || "");
  const { mutateAsync: updateUser, isLoading: isLoadingUpdate } = useUpdateUser();

  useEffect(() => {
    if (currentUser) {
      form.reset({
        file: undefined,
        Name: currentUser.Name,
        Username: currentUser.Username,
        Email: currentUser.Email,
        Bio: currentUser.Bio || "",
        ImageUrl: currentUser.ImageUrl || "",
        accountId: currentUser.accountId || "",
        Public: currentUser.Public,
      });
    }
  }, [currentUser, form]);

  const handleUpdate = async (data: z.infer<typeof formSchema>) => {
    try {
      let updatedUser;
      if (data.file) {
        updatedUser = await updateUser({
          userId: user.id,
          Name: data.Name,
          Bio: data.Bio,
          file: [data.file], 
          ImageUrl: data.ImageUrl,
          Public: data.Public,
        });
      } else {
        updatedUser = await updateUser({
          userId: user.id,
          Name: data.Name,
          Bio: data.Bio,
          file: [],
          ImageUrl: data.ImageUrl,
          Public: data.Public,
        });
      }

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
      toast({
        title: `Update Profile failed. Please try again.`,
        variant: "destructive",
      });
    }
  }

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
                      mediaUrl={currentUser.ImageUrl || ""}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      aria-label="Name"
                      spellCheck={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Username"
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
                      spellCheck={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Email"
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
                      spellCheck={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      className="shad-textarea custom-scrollbar"
                      {...field}
                      aria-label="Bio"
                      spellCheck={true}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Public"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Public &nbsp;</FormLabel>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </FormControl>
                  <FormDescription>
                    Uncheck this if you want to make your Account private
                  </FormDescription>
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
