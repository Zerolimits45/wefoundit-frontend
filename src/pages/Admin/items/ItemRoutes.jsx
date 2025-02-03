import { useContext, useEffect, createContext, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import NotFound from '../../errors/NotFound'
import Test from '../../Test'
import { AppContext } from '../../../App'
import { useSnackbar } from 'notistack'
import { Box, Button, Tabs, Tab, Typography, useTheme } from '@mui/material'
import ViewFarms from './ViewItems'
import { LayoutContext } from '../AdminRoutes'
import { ListRounded, TimelineRounded, AddRounded } from '@mui/icons-material'
import ViewItems from './ViewItems'


export const CategoryContext = createContext(null);
export default function ItemRoutes() {
    const [activePage, setActivePage] = useState(null);
    const { setContainerWidth } = useContext(LayoutContext);
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        setContainerWidth("xl")
    }, [])

    const handleTabChange = (event, newValue) => {
        setActivePage(newValue);
        switch (newValue) {
            case 0:
                navigate("/staff/items");
                break;
            case 1:
                navigate("/staff/farms/create");
                break;
        }
    }

    return (
        <>
            <CategoryContext.Provider value={{ activePage, setActivePage }}>
                <Routes>
                    <Route path="/" element={<ViewItems />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </CategoryContext.Provider>
        </>

    )
}