import { User } from "lucide-react"


export default function Navbar(){
    return (
    <div className="flex justify-end items-center w-full bg-white rounded-lg px-4 py-4">
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end ">
                <span className="text-sm text-stone-900">Manik Ajah</span>
                <span className="text-xs text-stone-400">Admin</span>
            </div>
            <div className="bg-stone-300 w-8 h-8 flex justify-center items-center rounded-full">
                <User className="text-white text-sm" />
            </div>
        </div>
    </div>)
}