import React, { useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
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
import { motion } from "framer-motion";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById, useUpdateUser } from "@/lib/react-query/queries";
import { User, Lock, AtSign, Mail, FileText, Globe } from "lucide-react";

const formSchema = z.object({
  Name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name must be less than 100 characters"),
  Username: z.string().max(100, "Username must be less than 100 characters"),
  Email: z.string().max(100, "Email must be less than 100 characters"),
  Bio: z.string().max(500, "Bio must be less than 500 characters"),
  ImageUrl: z.string().max(256, "Image Url must be less than 256 characters").optional(),
  accountId: z.string().max(100, "accountId must be less than 100 characters"),
  file: z.instanceof(File).optional(),
  Public: z.boolean()
});

const UpdateProfile: React.FC = () => {
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
        Public: updatedUser.Public,
      });
      toast({
        title: "Profile updated successfully!",
        description: "Your changes have been saved.",
        duration: 3000,
      });
      navigate(`/profile/${id}`);
    } catch (error) {
      toast({
        title: "Update Profile failed",
        description: "Please try again.",
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
        <p className="text-light-1">User not found.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-1 bg-dark-1"
    >
      <div className="common-container max-w-3xl mx-auto">
        <div className="flex-start gap-3 justify-start w-full mb-8">
          <User size={36} className="text-primary-500" />
          <h2 className="h3-bold md:h2-bold text-left w-full text-light-1">Edit Your Profile</h2>         
        </div>
        <p className="text-light-2 text-center mb-8">Complete your profile to get the most out of your experience.</p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="flex flex-col gap-7 w-full bg-dark-2 p-8 rounded-lg shadow-lg"
          >
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem className="flex justify-center">
                  <FormControl>
                    <ProfileUploader
                      fieldChange={field.onChange}
                      mediaUrl={currentUser.ImageUrl || ""}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-light-2 flex items-center">
                    <User size={18} className="mr-2" />
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="bg-dark-3 border-dark-4 text-light-1"
                      {...field}
                      aria-label="Name"
                      spellCheck={true}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-light-2 flex items-center">
                    <AtSign size={18} className="mr-2" />
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="bg-dark-3 border-dark-4 text-light-1"
                      {...field}
                      disabled
                      aria-label="Username"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-light-2 flex items-center">
                    <Mail size={18} className="mr-2" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="bg-dark-3 border-dark-4 text-light-1"
                      {...field}
                      disabled
                      aria-label="Email"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-light-2 flex items-center">
                    <FileText size={18} className="mr-2" />
                    Bio
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="bg-dark-3 border-dark-4 text-light-1 custom-scrollbar"
                      {...field}
                      aria-label="Bio"
                      spellCheck={true}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

<FormField
              control={form.control}
              name="Public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-dark-4 p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 mt-1 rounded border-dark-4 bg-dark-3"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-light-2 flex items-center">
                      <Globe size={18} className="mr-2" />
                      Public Profile
                    </FormLabel>
                    <FormDescription className="text-light-3">
                      Make your profile visible to everyone
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex gap-4 items-center justify-end mt-4">
              <Button
                type="button"
                className="bg-dark-4 text-light-1 hover:bg-dark-3"
                onClick={() => navigate(-1)}
                aria-label="Cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary-500 text-white hover:bg-primary-600"
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
    </motion.div>
  );
};

export default UpdateProfile;