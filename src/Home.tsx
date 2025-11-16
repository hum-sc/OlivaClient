import { useDispatch, useSelector } from 'react-redux';
import { getNotebooks, newNotebook, type Notebook, type User } from './hooks/useApi.ts';
import './styles/Home.css';
import { useEffect, useState } from 'react';
import type { RootState } from './store.ts';
import { useNavigate } from 'react-router';
import { setActiveNav } from './features/sidebar/sidebarSlice.ts';
import {type NavFab } from './features/sidebar/sidebarSlice.ts';
export default function Home() {
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const user: User = useSelector((state:any) => state.auth.user);
    const token = useSelector((state:RootState) => state.auth.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const nav: NavFab = {
        text: "Nueva libreta",
        icon: "edit",
        action: "newNotebook"
    }
    
    useEffect(()=>{
        dispatch(setActiveNav(nav));
        const downloadNotebooks = async () => setNotebooks(await getNotebooks(token!));
        token &&downloadNotebooks();
    },[])
    return (<>
        <section className="myNotes">
            <h2 className="headlineMedium">
                Mis notas
            </h2>
            {
                notebooks.length == 0 ? <p>No hay notas recientes.</p> : notebooks.map((n)=>{
                    return <h4 key={n.notebook_id} onClick={()=>navigate(`/editor/${n.notebook_id}`)}>{n.title}</h4>
                })
            }
        </section>
        </>
    );
}