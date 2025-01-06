"use client"

// convex
import { api } from "@/convex/_generated/api"
import { Preloaded, usePreloadedQuery } from "convex/react"
import { useMutation } from "convex/react"
import { fetchMutation } from "convex/nextjs"

// icons
import { ArrowLeft, Camera, Edit2 } from "lucide-react"

// react
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import Link from "next/link"

// shadcn components
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"


interface ProfileFormData {
    name: string;
}

export default function ProfileComponent({preloadedUserInfo}: {
    preloadedUserInfo: Preloaded<typeof api.users.readUser>
}){
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const userInfo = usePreloadedQuery(preloadedUserInfo)
    const updateUserMutation = useMutation(api.users.updateName)

    const {
        register, 
        handleSubmit, 
        watch, 
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: userInfo?.name || "",
        }
    })

    const onSubmit = async (data: ProfileFormData) => {
        try {
            if(userInfo?.userId){
                console.log("here")
                await updateUserMutation ({userId: userInfo.userId, name: data.name})
            } else {
                console.error("User ID is undefined")   
            }

            setIsEditing(false)
            router.refresh()
        } catch (error) {
            console.error(error)

        }
    }
    
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e?.target?.files?.[0]

        if(!file) return

        try {
            const reader = new FileReader()
            reader.onloadend = () => {

            }

            reader.readAsDataURL(file)
            const postUrl = await fetchMutation(api.chats.generateUploadUrl)

            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-type": file.type },
                body: file
            })

            if (!result.ok) {
                throw new Error (`Upload failed ${result.statusText}`)
            }

            const { storageId } = await result.json();

            const url = await fetchMutation(api.chats.getUploadUrl, {
                storageId
            })

            if (url && userInfo?.userId) {
                await fetchMutation(api.users.updateProfileImage, {
                    userId: userInfo?.userId,
                    profileImage: url
                })
            }

        } catch (error) {
            console.error("Upload failed:", error)
        }
    }

    return (
        <>
        <header className="bg-[#202C33] p-4 flex items-center">
            <Link href="/chat">
                <Button variant="ghost" size="icon" className="mr-4">
                    <ArrowLeft className="h-6 w-6 text-[#00A884]" />
                </Button>
            </Link>
            <h1 className="text-xl font-normal">Profile</h1>
        </header>

        <div className="overflow-y-auto">
            <div className="p-4 flex flex-col items-center">
                <div className="relative mb-6">
                    <Avatar className="h-40 w-40">
                        <AvatarImage src={userInfo?.profileImage} alt={userInfo?.name || ""} />
                        <AvatarFallback>{userInfo?.name}</AvatarFallback>
                    </Avatar>
                    <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-[#00A884] rounded-full p-2 cursor-pointer">
                        <Camera className="w-6 h-6 text-[#111B21]" />
                        <input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange} 
                        />
                    </label>
                </div>

                <div className="w-full max-w-md space-y-4">
                    <div className="bg-[#202C33] p-4 rounded-lg">
                        <Label htmlFor="name" className="text-[#8696A0] text-sm">Name</Label>
                        {
                            isEditing? (
                                <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2 mt-1">
                                    <Input
                                        {...register("name", {
                                            required:true
                                        })}
                                        className="bg-transparent border-none text-[#E9EDEF] focus-visible: ring-0"
                                        autoFocus
                                        onBlur={() => {
                                            handleSubmit(onSubmit)
                                        }}
                                    />
                                    <Button type="submit" size="sm" className="bg-[#00A884] hover:bg-[#00957B]">
                                        Save
                                    </Button>
                                    
                                </form>
                            ) : (
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[#E9EDEF]">{userInfo?.name}</span>
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                                        <Edit2 className="h-5 w-5 text-[#00A884]" />
                                    </Button>
                                </div>
                            )
                        }
                        {
                            errors.name && (
                                <span className="text-red-500 text-sm mt-1">Name is required</span>
                        )}
                    </div>

                    <div className="bg-[#202C33] p-4 rounded-lg">
                        <Label className="text-[#8696A0] text-sm">Email</Label>
                        <div className="text-[#E9EDEF] mt-1">{userInfo?.email}</div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}