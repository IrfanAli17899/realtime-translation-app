import { useDarkMode } from '@/hooks/useDarkMode'
import React from 'react'

function Loader() {
    const {isDarkMode} = useDarkMode()
  return (
    <div
    className={`${
      isDarkMode ? "dark" : ""
    } h-full bg-gray-100 dark:bg-gray-900`}
  >
    <div className='h-full flex justify-center items-center'>
        <div className='h-14 w-14 border-2 rounded-full border-zinc-300 border-r-blue-600 animate-spin' />
    </div>
    </div>
  )
}

export default Loader