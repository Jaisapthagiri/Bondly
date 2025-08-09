import { useState, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Messages from './pages/Messages';
import ChatBox from './pages/ChatBox';
import Connections from './pages/Connections';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import { useAuth, useUser } from '@clerk/clerk-react';
import Layout from './pages/Layout';
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchUser } from './features/user/userSlice';
import { fetchConnections } from './features/connections/connectionSlice';
import { useRef } from 'react';
import { addMessages } from './features/messages/messageSlice';
import Notification from './components/Notification';

function App() {
  const { user } = useUser();
  const { getToken } = useAuth()
  const {pathname} = useLocation()
  const pathNameRef = useRef(pathname)

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken()
        dispatch(fetchUser(token))
        dispatch(fetchConnections(token))
      }
    }
    fetchData()
  }, [user, getToken, dispatch]);

  useEffect(() => {
    pathNameRef.current = pathname
  }, [pathname])

  useEffect(() => {
    if (!user || !user.id) return;

    // Use the correct env variable name for base URL
    const eventSource = new EventSource(`${import.meta.env.VITE_BASE_URL}/api/message/${user.id}`);

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // Get the current chat userId from the URL
      const currentPath = pathNameRef.current;
      const chatMatch = currentPath.match(/\/messages\/(.+)$/);
      const currentChatUserId = chatMatch ? chatMatch[1] : null;
      // Only add the message if it belongs to the current chat
      if (
        currentChatUserId &&
        (message.from_user_id === currentChatUserId || message.to_user_id === currentChatUserId)
      ) {
        dispatch(addMessages(message));
      }else{
        toast.custom((t) => {
          <Notification t={t} message={message} />
        },{position:"bottom-right"})
      }
    };

    return () => {
      eventSource.close();
    };
  }, [user, dispatch]);


  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path='messages' element={<Messages />} />
          <Route path='messages/:userId' element={<ChatBox />} />
          <Route path='connections' element={<Connections />} />
          <Route path='discover' element={<Discover />} />
          <Route path='profile' element={<Profile />} />
          <Route path='profile/:profileId' element={<Profile />} />
          <Route path='create-post' element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
