
export default function AuthLayout({ children }) {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-stone-50">
            {children}
        </div>
    )
}