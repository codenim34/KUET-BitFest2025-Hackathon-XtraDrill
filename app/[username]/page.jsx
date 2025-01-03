import { currentUser } from "@clerk/nextjs";
import { fetchUserByUsername } from "@/lib/actions/user.actions";
import { getUserStories, getLikedStories } from "@/lib/actions/story.actions";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, User2, Heart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

const truncateContent = (content) => {
  const plainText = content.replace(/<[^>]+>/g, '');
  return plainText.length > 100 ? plainText.substring(0, 100) + "..." : plainText;
};

export default async function UserProfilePage({ params }) {
  const { username } = params;
  const currentUserData = await currentUser();
  
  // Fetch the profile user by username
  const profileUser = await fetchUserByUsername(username);
  
  if (!profileUser) {
    notFound();
  }

  try {
    const publicStoriesResponse = await getUserStories(profileUser.clerkId, "public");
    const likedStoriesResponse = await getLikedStories(profileUser.clerkId);
    
    const publicStories = publicStoriesResponse.success ? publicStoriesResponse.data : [];
    const likedStories = likedStoriesResponse.success ? likedStoriesResponse.data : [];

    const StoryGrid = ({ stories }) => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {stories.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-8">No stories found.</p>
        ) : (
          stories.map((story) => (
            <Link href={`/stories/${story._id}`} key={story._id}>
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer border border-gray-100 flex flex-col h-[220px]">
                <div className="p-6 flex flex-col h-full">
                  <div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 hover:text-orange-600 transition-colors line-clamp-2">
                      {story.title}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {truncateContent(story.content)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart 
                          className={cn(
                            "w-4 h-4",
                            currentUserData && story.loves?.includes(currentUserData.id) ? "fill-red-500 text-red-500" : "text-gray-500"
                          )}
                        />
                        <span>{story.loves?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    );

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
            <Image
              src={profileUser.image_url || "/default-avatar.png"}
              alt={profileUser.firstName}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {profileUser.firstName} {profileUser.lastName}
          </h1>
          <p className="text-gray-500">@{profileUser.userName}</p>
        </div>

        <Tabs defaultValue="public" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-[400px] mx-auto mb-8">
            <TabsTrigger value="public" className="flex items-center gap-2">
              <User2 className="w-4 h-4" />
              Public Stories
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Loved Stories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="public">
            <StoryGrid stories={publicStories} />
          </TabsContent>

          <TabsContent value="liked">
            <StoryGrid stories={likedStories} />
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error("Error fetching user data:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Error loading profile data.</p>
      </div>
    );
  }
}
