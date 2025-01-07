import { api } from "@/convex/_generated/api"
import { auth } from "@clerk/nextjs/server"
import { preloadQuery } from "convex/nextjs"


export default async function ChatLayout({ children }: { 
    children: React.ReactNode
 }) {
    const { userId } = await auth()


    // user information
    const preloadedUserInfo = await preloadQuery(api.users.readUser, {
        userId:userId!
    })



    return (
        <ChatLayoutWrapper
        preloadedUserInfo={preloadedUserInfo}
        >
        {children}
        </ChatLayoutWrapper>
    )
}