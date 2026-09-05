import { useState } from "react";
import { BACKEND_URL } from '@/lib/apiConfig';
import { createClient } from '@/utils/supabase/client';

export default function EditContentModal({ content, close, onUpdate }) {
  const [title, setTitle] = useState(content.title);
  const [type, setType] = useState(content.type);
  const [status, setStatus] = useState(content.status);

  const handleSave = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser(); // Add this line to avoid Next.js warnings
      const token = session?.access_token;

      const res = await fetch(`${BACKEND_URL}/api/content/${content.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ title, type, status }),
      });

      const updatedContent = await res.json();

      // 🔥 Update UI instantly
      onUpdate(updatedContent);

      close();
    } catch (error) {
      console.error("Error updating content:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-[400px]">

        <h2 className="text-xl font-semibold mb-4">Edit Content</h2>

        {/* Title */}
        <input
          className="w-full border p-2 mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />

        {/* Type */}
        <select
          className="w-full border p-2 mb-3"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="music">Music</option>
          <option value="movie">Movie</option>
          <option value="story">Story</option>
        </select>

        {/* Status */}
        <select
          className="w-full border p-2 mb-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button onClick={close}>Cancel</button>
          <button 
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-1 rounded"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}