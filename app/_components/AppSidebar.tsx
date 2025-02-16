import React, { useState } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
} from "@/components/ui/sidebar";
import { CircleDollarSign, Home, Paintbrush } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Design from '../(routes)/design/Design'; // Import your Design component

const items = [
    {
        title: "WorkSpace",
        url: "/dashboard",
        icon: Home,
    },
    // {
    //     title: "Design",
    //     icon: Paintbrush,
    // },
    // {
    //     title: "Credits",
    //     url: "/credits",
    //     icon: CircleDollarSign,
    // },
];

export function AppSidebar() {
    const path = usePathname();
    const [showDesign, setShowDesign] = useState(false); // State to control Design component visibility

    const handleDesignClick = () => {
        setShowDesign(true); // Show the Design component when the button is clicked
    };

    return (
        <>
            <Sidebar>
                <SidebarHeader>
                    <div className='p-4'>
                        <Image src={'/logo.svg'} alt='logo' width={100} height={100}
                            className='w-full h-full' />
                        <h2 className='text-sm text-gray-400 text-center'>Build Awesome</h2>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu className='mt-5'>
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={item.title === "Design" ? handleDesignClick : undefined} // Handle Design button click
                                        className={`p-2 text-lg flex gap-2 items-center 
                                            hover:bg-gray-100 rounded-lg ${path === item.url ? 'bg-gray-200' : ''}`}
                                    >
                                        <item.icon className='h-5 w-5' />
                                        <span>{item.title}</span>
                                    </div>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <h2 className='p-2 text-gray-400 text-sm'>Copyright @Densingh</h2>
                </SidebarFooter>
            </Sidebar>

            {/* Conditionally render the Design component */}
            {showDesign && <Design />}
        </>
    );
}