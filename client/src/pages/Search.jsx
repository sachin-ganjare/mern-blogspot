import { useEffect, useState } from 'react';
import { Button, Select, TextInput } from 'flowbite-react';
import { useLocation, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';

export default function Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: 'desc',
    category: '',
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm') || '';
    const sortFromUrl = urlParams.get('order') || 'desc';
    const categoryFromUrl = urlParams.get('category') || '';

    Promise.resolve().then(() => {
      setSidebarData(prev => {
        if (
          prev.searchTerm !== searchTermFromUrl ||
          prev.sort !== sortFromUrl ||
          prev.category !== categoryFromUrl
        ) {
          return {
            searchTerm: searchTermFromUrl,
            sort: sortFromUrl,
            category: categoryFromUrl,
          };
        }
        return prev;
      });
    });

    const fetchPosts = async () => {
      setLoading(true);
      const searchQuery = urlParams.toString();
      try {
        const res = await fetch(`/api/post/getposts?${searchQuery}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        setPosts(data.posts || []);
        setLoading(false);
        if (data.posts && data.posts.length === 9) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, [location.search]);

  const handleChange = (e) => {
    if (e.target.id === 'searchTerm') {
      setSidebarData({ ...sidebarData, searchTerm: e.target.value });
    }
    if (e.target.id === 'sort') {
      const order = e.target.value || 'desc';
      setSidebarData({ ...sidebarData, sort: order });
    }
    if (e.target.id === 'category') {
      const category = e.target.value || '';
      setSidebarData({ ...sidebarData, category });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    if (sidebarData.searchTerm) {
      urlParams.set('searchTerm', sidebarData.searchTerm);
    } else {
      urlParams.delete('searchTerm');
    }
    urlParams.set('order', sidebarData.sort);
    if (sidebarData.category) {
      urlParams.set('category', sidebarData.category);
    } else {
      urlParams.delete('category');
    }
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handleShowMore = async () => {
    const numberOfPosts = posts.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', numberOfPosts);
    const searchQuery = urlParams.toString();
    try {
      const res = await fetch(`/api/post/getposts?${searchQuery}`);
      if (res.ok) {
        const data = await res.json();
        setPosts([...posts, ...(data.posts || [])]);
        if (data.posts && data.posts.length === 9) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='flex flex-col md:flex-row min-h-screen bg-slate-50/30 dark:bg-[rgb(10,18,32)] transition-colors duration-300'>
      {/* Sidebar Filters */}
      <div className='p-7 border-b md:border-r md:min-h-screen border-slate-200/50 dark:border-slate-800/40 bg-white/30 dark:bg-slate-950/20 backdrop-blur-xs w-full md:w-80 shrink-0'>
        <form className='flex flex-col gap-6' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-2'>
            <label className='font-semibold text-slate-700 dark:text-slate-350 text-sm'>
              Search Term:
            </label>
            <TextInput
              placeholder='Search...'
              id='searchTerm'
              type='text'
              value={sidebarData.searchTerm}
              onChange={handleChange}
              className='w-full'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label className='font-semibold text-slate-700 dark:text-slate-350 text-sm'>
              Sort Order:
            </label>
            <Select
              onChange={handleChange}
              value={sidebarData.sort}
              id='sort'
              className='w-full'
            >
              <option value='desc'>Latest</option>
              <option value='asc'>Oldest</option>
            </Select>
          </div>
          <div className='flex flex-col gap-2'>
            <label className='font-semibold text-slate-700 dark:text-slate-350 text-sm'>
              Category:
            </label>
            <Select
              onChange={handleChange}
              value={sidebarData.category}
              id='category'
              className='w-full'
            >
              <option value=''>All Categories</option>
              <option value='uncategorized'>Uncategorized</option>
              <option value='tipstricks'>Tips & Tricks</option>
              <option value='news'>News</option>
              <option value='ai'>Artificial Intelligence</option>
            </Select>
          </div>
          <Button
            type='submit'
            outline
            gradientDuoTone='purpleToPink'
            className='w-full mt-2 font-semibold'
          >
            Apply Filters
          </Button>
        </form>
      </div>

      {/* Results Section */}
      <div className='w-full p-6 md:p-10'>
        <div className='flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/40 pb-4 mb-8'>
          <h1 className='text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white'>
            Search Results
          </h1>
          {!loading && (
            <span className='text-sm text-slate-500 dark:text-slate-400 font-medium'>
              {posts.length} {posts.length === 1 ? 'post' : 'posts'} found
            </span>
          )}
        </div>

        {/* Loading / Skeleton State */}
        {loading && (
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse'>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className='w-full flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 p-5 min-h-[380px]'
              >
                <div>
                  <div className='aspect-video w-full rounded-xl bg-slate-250 dark:bg-slate-800 mb-5' />
                  <div className='flex items-center justify-between mb-4'>
                    <div className='h-5 w-20 rounded-full bg-slate-250 dark:bg-slate-800' />
                    <div className='h-4 w-24 rounded-md bg-slate-250 dark:bg-slate-800' />
                  </div>
                  <div className='h-6 w-full rounded-md bg-slate-250 dark:bg-slate-800 mb-3' />
                  <div className='h-6 w-2/3 rounded-md bg-slate-250 dark:bg-slate-800 mb-4' />
                  <div className='h-4 w-full rounded-md bg-slate-250 dark:bg-slate-800 mb-2' />
                  <div className='h-4 w-5/6 rounded-md bg-slate-250 dark:bg-slate-800' />
                </div>
                <div className='h-4 w-24 rounded-md bg-slate-250 dark:bg-slate-800 mt-6 pt-4 border-t border-slate-100/50 dark:border-slate-800/40' />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className='text-center py-16 px-4 bg-white/30 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl w-full max-w-2xl mx-auto mt-8'>
            <svg
              className='mx-auto h-12 w-12 text-slate-400 dark:text-slate-650 mb-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
            <h3 className='text-lg font-bold text-slate-800 dark:text-slate-100 mb-1'>No posts found</h3>
            <p className='text-slate-500 dark:text-slate-400 text-sm'>
              We couldn't find any articles matching your search criteria. Try adjusting your search query or filters.
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && posts.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}

        {/* Show More */}
        {showMore && !loading && (
          <div className='w-full flex justify-center mt-12'>
            <button
              onClick={handleShowMore}
              className='px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer'
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
