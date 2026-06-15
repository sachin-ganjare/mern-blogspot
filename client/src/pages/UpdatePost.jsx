import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, FileInput, Select, TextInput, Alert } from 'flowbite-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css';


export default function UpdatePost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('uncategorized');
  const [content, setContent] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional basic guardrails (Cloudinary may enforce limits server-side)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 5 MB');
      e.target.value = '';
      return;
    }

    setErrorMessage(null);
    setUploadedImageUrl(null);
    setUploadProgress(0);
    setImageFile(file);
    e.target.value = '';
  };

  useEffect(() => {
    const uploadImage = async () => {
      if (!imageFile) return;

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const folder = import.meta.env.VITE_CLOUDINARY_FOLDER || 'post-images';

      if (!cloudName || !uploadPreset) {
        setErrorMessage(
          'Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.'
        );
        return;
      }

      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);

      // Helps avoid collisions; slug is handled on backend.
      const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
      const randomString = Math.random().toString(36).slice(2, 7);
      formData.append('public_id', `${timestamp}-${randomString}`);

      setUploading(true);
      setUploadProgress(0);
      setErrorMessage(null);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        setUploading(false);

        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          setUploadedImageUrl(data.secure_url);
          setUploadProgress(100);
          setImageFile(null);
          return;
        }

        const data = JSON.parse(xhr.responseText || '{}');
        setErrorMessage(data?.error?.message || 'Image upload failed');
      };

      xhr.onerror = () => {
        setUploading(false);
        setErrorMessage('Failed to upload image.');
      };

      xhr.send(formData);
    };

    uploadImage();
  }, [imageFile]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/post/getposts?postId=${postId}&limit=1`);
        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data?.message || 'Failed to load post');
          return;
        }

        const post = data?.posts?.[0];
        if (!post) return;

        setTitle(post.title || '');
        setCategory(post.category || 'uncategorized');
        setContent(post.content || '');
        setUploadedImageUrl(post.image || null);
      } catch (err) {
        setErrorMessage(err?.message || 'Failed to load post');
      }
    };

    if (postId) fetchPost();
  }, [postId]);

  const handlePublish = async (e) => {
    e.preventDefault();

    if (!postId) {
      setErrorMessage('Missing post id');
      return;
    }

    if (uploading) {
      setErrorMessage('Please wait for the image upload to finish.');
      return;
    }

    if (!title.trim() || !content || content.trim() === '<p><br></p>') {
      setErrorMessage('Please provide both title and content.');
      return;
    }

    setErrorMessage(null);

    try {
      const res = await fetch(`/api/post/update/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // verifyToken checks req.cookies.access_token, so we must send cookies
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          content,
          category,
          image: uploadedImageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data?.message || 'Failed to update post');
        return;
      }

      setErrorMessage(null);
      navigate(`/post/${data.slug}`);
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to update post');
    }
  };

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-center text-3xl my-7 font-semibold'>Update post</h1>

      {errorMessage && (
        <Alert color='failure' onDismiss={() => setErrorMessage(null)} className='mb-4'>
          {errorMessage}
        </Alert>
      )}

      <form className='flex flex-col gap-4' onSubmit={handlePublish}>
        <div className='flex flex-col gap-4 sm:flex-row justify-between'>
          <TextInput
            type='text'
            placeholder='Title'
            required
            id='title'
            className='flex-1'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value='uncategorized'>Select a category</option>
            <option value='tipstricks'>Tips and Tricks</option>
            <option value='news'>News</option>
            <option value='ai'>Artificial Intelligence</option>
          </Select>
        </div>

        <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3'>
          <FileInput type='file' accept='image/*' onChange={handleImageChange} />

          <div className='flex flex-col items-center gap-2'>
            {uploading ? (
              <div className='w-24 h-24'>
                <CircularProgressbar
                  value={uploadProgress}
                  text={`${uploadProgress}%`}
                  strokeWidth={6}
                  styles={buildStyles({
                    strokeLinecap: 'round',
                    textSize: '16px',
                    pathColor: '#14b8a6',
                    textColor: 'gray',
                    trailColor: '#e2e8f0',
                  })}
                />
              </div>
            ) : (
              <Button type='button' outline size='sm'>
                Upload image
              </Button>
            )}
          </div>
        </div>

        {uploadedImageUrl && (
          <img
            src={uploadedImageUrl}
            alt='Uploaded'
            className='w-full h-50 object-cover'
          />
        )}

        <ReactQuill
          className='h-72 mb-12'
          theme='snow'
          placeholder='write something...'
          value={content}
          onChange={setContent}
        />

        <Button type='submit' disabled={uploading}>
          {uploading ? 'Uploading...' : 'Update'}
        </Button>
      </form>
    </div>
  );
}

