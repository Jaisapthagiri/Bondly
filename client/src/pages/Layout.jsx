import { useState } from 'react'
import SideBar from '../components/SideBar'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Loading from '../components/Loading'
import { useSelector } from 'react-redux'

const Layout = () => {
  const user = useSelector((state)=>state.user.value)
  const [sidebarOpen, setSidebarOpen] = useState()

  return user ? (
    <div>
      <div className='w-full flex h-screen'>
        <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className='flex-1 bg-slate-50' >
          <Outlet />
        </div>
        {
          sidebarOpen ?
            <X className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={() => setSidebarOpen(false)} />
            :
            <Menu className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={() => setSidebarOpen(true)} />

        }
      </div>
    </div>
  ) : (
    <div>
      <Loading />
    </div>
  )
}

export default Layout