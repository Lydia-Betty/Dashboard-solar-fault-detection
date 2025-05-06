"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import styles from "./search.module.css"
import { MdOutlineSearch } from "react-icons/md"
import { useDebouncedCallback } from "use-debounce"

const Search = ({placeholder}) => {
    const searchParams = useSearchParams()
    const {replace} = useRouter()
    const pathname = usePathname()
    const handleSearch =useDebouncedCallback((e) =>{
        const params = new URLSearchParams(searchParams)
        
        if(e.target.value){
            e.target.value.length > 2 && params.set("q", e.target.value)
        }else{
            params.delete("q")
        }
        replace(`${pathname}?${params}`)
    }, 300)


    console.log(searchParams)
    console.log(pathname)
    return (
        <div className={styles.container}>
            <MdOutlineSearch/>
            <input type="text" placeholder={placeholder} className={styles.input} onChange={handleSearch} />
        </div>
    )

}

export default Search