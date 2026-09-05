// /app/reels/page.jsx
import VideoPlayer from './VideoPlayer';

// As the backend is now using Cloudinary/standalone Node.js,
// we fetch the videos from the backend or an external source
// instead of reading the local filesystem.
async function getVideos() {
  try {
    // Replace with your actual backend API endpoint if needed
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reels`);
    // const data = await res.json();
    // return data.videos;
    return []; // Temporary empty array until API integration
  } catch (error) {
    console.error('Failed to fetch videos from backend:', error);
    return [];
  }
}

export default async function ReelsPage() {
  const videoUrls = await getVideos();

  // Your page must return a single element. You can use a fragment or a div.
  return (
    <div>
      <div className="reels-container">
        {videoUrls.length > 0 ? (
          videoUrls.map((url) => (
            <VideoPlayer key={url} src={url} />
          ))
        ) : (
          <p>No videos available at the moment. Please upload via Cloudinary backend.</p>
        )}
      </div>
    </div>
  );
}