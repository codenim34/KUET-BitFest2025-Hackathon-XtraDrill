import { currentUser } from "@clerk/nextjs";
import { fetchUserByClerkId } from "@/lib/actions/user.actions";
import { getUserStories, getLikedStories } from "@/lib/actions/story.actions";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, User2, Heart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const truncateContent = (content) => {
  const plainText = content.replace(/<[^>]+>/g, '');
  return plainText.length > 100 ? plainText.substring(0, 100) + "..." : plainText;
};

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUserByClerkId(user.id);
  const publicStoriesResponse = await getUserStories(user.id, "public");
  const privateStoriesResponse = await getUserStories(user.id, "private");
  const likedStoriesResponse = await getLikedStories(user.id);
  
  const publicStories = publicStoriesResponse.success ? publicStoriesResponse.data : [];
  const privateStories = privateStoriesResponse.success ? privateStoriesResponse.data : [];
  const likedStories = likedStoriesResponse.success ? likedStoriesResponse.data : [];

  const StoryGrid = ({ stories }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {stories.map((story) => (
        <Link href={`/stories/${story._id}`} key={story._id}>
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer border border-gray-100">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-900 hover:text-orange-600 transition-colors">
                {story.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {truncateContent(story.content)}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart 
                      className={cn(
                        "w-4 h-4",
                        story.loves?.includes(user.id) ? "fill-red-500 text-red-500" : ""
                      )} 
                    />
                    <span>{story.loves?.length || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User2 className="w-4 h-4" />
                  <span>{story.authorName}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
      {stories.length === 0 && (
        <div className="col-span-full text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600">No stories yet</h3>
          <p className="text-gray-500 mt-2">
            {stories === likedStories ? "Like some stories to see them here!" : "Create your first story!"}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden">
            <Image
              src={userInfo.image_url || user.imageUrl}
              alt="Profile picture"
              fill
              className="object-cover"
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{userInfo.userName}</h1>
            <p className="text-gray-600">{userInfo.email}</p>
          </div>
        </div>

        <Tabs defaultValue="public" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="public">Public Stories</TabsTrigger>
            <TabsTrigger value="private">Private Stories</TabsTrigger>
            <TabsTrigger value="liked">Loved Stories</TabsTrigger>
          </TabsList>
          <TabsContent value="public" className="mt-6">
            <StoryGrid stories={publicStories} />
          </TabsContent>
          <TabsContent value="private" className="mt-6">
            <StoryGrid stories={privateStories} />
          </TabsContent>
          <TabsContent value="liked" className="mt-6">
            <StoryGrid stories={likedStories} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
