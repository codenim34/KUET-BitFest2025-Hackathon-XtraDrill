import { currentUser } from "@clerk/nextjs";
import { fetchUserByClerkId } from "@/lib/actions/user.actions";
import { getUserStories, getLikedStories } from "@/lib/actions/story.actions";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, User2, Heart, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";

const truncateContent = (content) => {
  const plainText = content.replace(/<[^>]+>/g, '');
  return plainText.length > 100 ? plainText.substring(0, 100) + "..." : plainText;
};

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) return null;

  try {
    const userInfo = await fetchUserByClerkId(user.id);
    const publicStoriesResponse = await getUserStories(user.id, "public");
    const privateStoriesResponse = await getUserStories(user.id, "private");
    const likedStoriesResponse = await getLikedStories(user.id);
    
    const publicStories = publicStoriesResponse.success ? publicStoriesResponse.data : [];
    const privateStories = privateStoriesResponse.success ? privateStoriesResponse.data : [];
    const likedStories = likedStoriesResponse.success ? likedStoriesResponse.data : [];

    const StoryGrid = ({ stories }) => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {stories.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
            <div className="bg-gray-50 rounded-full p-6 mb-4">
              {stories === publicStories && <User2 className="w-8 h-8 text-gray-400" />}
              {stories === privateStories && <User2 className="w-8 h-8 text-gray-400" />}
              {stories === likedStories && <Heart className="w-8 h-8 text-gray-400" />}
            </div>
            <p className="text-gray-600 text-lg font-medium mb-2">No stories found</p>
            <p className="text-gray-500 text-center max-w-sm">
              {stories === publicStories && "Share your thoughts with the world by creating your first public story."}
              {stories === privateStories && "Keep your personal thoughts safe by creating a private story."}
              {stories === likedStories && "Show appreciation for stories you enjoy by giving them some love."}
            </p>
            {(stories === publicStories || stories === privateStories) && (
              <Link 
                href="/stories/create" 
                className="mt-4 inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create Story
              </Link>
            )}
          </div>
        ) : (
          stories.map((story) => (
            <Link href={`/stories/${story._id}`} key={story._id}>
              <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer border border-gray-100 flex flex-col h-[220px]">
                <div className="p-6 flex flex-col h-full">
                  <div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
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
                            "w-4 h-4 transition-colors",
                            story.loves?.includes(user.id) ? "fill-red-500 text-red-500" : "text-gray-500 group-hover:text-red-500"
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg">
                  <Image
                    src={user.imageUrl || "/default-avatar.png"}
                    alt={user.firstName}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {user.firstName} {user.lastName}
                    </h1>
                    <p className="text-gray-500 mb-4">{user.emailAddresses[0].emailAddress}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                      <LinkIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 select-all font-medium">
                        {userInfo.userName}
                      </span>
                      <CopyButton 
                        text={`${process.env.NEXT_PUBLIC_APP_URL}/${userInfo.userName}`}
                      />
                    </div>
                    
                    <Link 
                      href={`/${userInfo.userName}`}
                      className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors px-4 py-2 bg-orange-50 rounded-xl font-medium hover:bg-orange-100"
                    >
                      <User2 className="w-4 h-4" />
                      View Public Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <Tabs defaultValue="public" className="w-full">
              <TabsList className="inline-flex h-14 items-center justify-center rounded-xl bg-gray-100 p-1 text-gray-500 mx-auto mb-8">
                <TabsTrigger 
                  value="public" 
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  <User2 className="w-4 h-4" />
                  Public Stories
                </TabsTrigger>
                <TabsTrigger 
                  value="private" 
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  <User2 className="w-4 h-4" />
                  Private Stories
                </TabsTrigger>
                <TabsTrigger 
                  value="liked" 
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  <Heart className="w-4 h-4" />
                  Loved Stories
                </TabsTrigger>
              </TabsList>

              <TabsContent value="public" className="focus-visible:outline-none">
                <StoryGrid stories={publicStories} />
              </TabsContent>

              <TabsContent value="private" className="focus-visible:outline-none">
                <StoryGrid stories={privateStories} />
              </TabsContent>

              <TabsContent value="liked" className="focus-visible:outline-none">
                <StoryGrid stories={likedStories} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in ProfilePage:", error);
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Something went wrong. Please try again later.</p>
      </div>
    );
  }
}
