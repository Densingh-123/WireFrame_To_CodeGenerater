import { SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import ProfileAvatar from './ProfileAvatar'

function AppHeader() {
    return (
        <div className='p-4 shadow-sm flex items-center justify-between w-full '>
            <SidebarTrigger />
            <ProfileAvatar />
        </div>
    )
}

export default AppHeader