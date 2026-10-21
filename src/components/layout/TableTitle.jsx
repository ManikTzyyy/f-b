export default function TableTitle({title, desc}){
    return (
    <div>
        <span className="text-stone-700 font-bold">{title}</span>
        <span className="block text-xs text-stone-400">{desc}</span>
    </div>
)
}