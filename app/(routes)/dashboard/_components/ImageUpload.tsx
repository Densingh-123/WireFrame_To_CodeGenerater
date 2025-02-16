"use client";
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { CloudUpload, X, WandSparkles } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from 'next/image';
import { storage } from '@/configs/firebaseConfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { v4 as uuid4 } from 'uuid';
import { useAuthContext } from '@/app/provider';
import { useRouter } from 'next/navigation';
import { AiModelList } from '@/data/Constants';

const ImageUpload = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthContext();
  const router = useRouter();

  const onImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      setFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setFile(null);
  };

  const OnConvertToCodeButtonClick = async () => {
    if (isSubmitting) {
      toast.error('Please wait, your request is being processed.');
      return;
    }

    if (!file || !model || !description) {
      toast.error('Please fill all fields before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fileName = Date.now() + '.png';
      const imageRef = ref(storage, "Wireframe_To_Code/" + fileName);
      await uploadBytes(imageRef, file);
      const imageUrl = await getDownloadURL(imageRef);

      const uid = uuid4();
      const result = await axios.post('/api/wireFrame-to-code', {
        uid,
        description,
        imageUrl,
        model,
        email: user?.email,
      });

      console.log('API Response:', result.data);
      toast.success('Wireframe uploaded successfully!');
      router.push(`/view-code/${uid}`);
    } catch (error) {
      console.error('Error uploading wireframe:', error);
      toast.error('Failed to upload wireframe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Toaster />
      <div className='lg:px:30 xl:px-40'>
        <h2 className='font-bold text-3xl'>Convert Wireframe to Code</h2>
        <div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
            {previewUrl ? (
              <div className='mt-10 p-7 border shadow-md rounded-md relative'>
                <img
                  src={previewUrl}
                  alt='Preview'
                  className='w-full h-auto object-contain rounded-md'
                />
                <button
                  onClick={removeImage}
                  className='absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100'
                >
                  <X className='h-5 w-5 text-gray-700' />
                </button>
              </div>
            ) : (
              <div className='mt-10 p-7 border shadow-md border-dashed rounded-md flex flex-col items-center justify-center'>
                <CloudUpload className='h-10 w-10' />
                <h2 className='font-bold text-lg'>Upload Image</h2>
                <p className='text-gray-400 mt-5'>Click Button Select WireFrame Image</p>

                <Button className='p-5 border-dashed w-full flex justify-center mt-7'>
                  <label htmlFor='imageSelect' className='cursor-pointer'>
                    <h2>Select Image</h2>
                  </label>
                </Button>
                <input
                  type='file'
                  id='imageSelect'
                  className='hidden'
                  onChange={onImageSelect}
                />
              </div>
            )}

            <div className='p-7 border shadow-md rounded-lg'>
              <Select onValueChange={(value) => setModel(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  {AiModelList.map((model, index) => (
                    <SelectItem key={index} value={model.name}>
                      <div className="flex items-center gap-2">
                        <Image
                          src={model.icon}
                          alt={model.name}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                        <h2>{model.name}</h2>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <h2 className='font-bold text-lg mt-7'>Enter Description about your webpage</h2>
              <Textarea
                onChange={(event) => setDescription(event.target.value)}
                className='mt-3 h-[250px]'
                placeholder='Write about your Webpage'
              />
            </div>
          </div>

          <div className='mt-10 flex justify-center items-center'>
            <Button
              className=''
              onClick={OnConvertToCodeButtonClick}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <WandSparkles className='mr-2 animate-spin' /> Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  <WandSparkles className='mr-2' /> Convert to code
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;