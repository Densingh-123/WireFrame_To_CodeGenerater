"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

const Design = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from the API route
        const response = await axios.get('/api/get-wireframe-to-code');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 w-full">
      <h1 className="text-3xl font-bold mb-8">Wireframe to Code Designs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-full">
        {data.map((item) => (
          <div
            key={item.uid}
            className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg"
          >
            <div className="relative h-48 w-full">
              <Image
                src={item.imageUrl}
                alt="Wireframe Image"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{item.model}</h2>
              <p className="text-gray-400 mb-4">{item.description}</p>
              <p className="text-sm text-gray-400">Created by: {item.createdBy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Design;