import { useContext, useEffect, createContext, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import NotFound from '../errors/NotFound'
import Test from '../Test'
import { AppContext } from '../../App'
import { useSnackbar } from 'notistack'
import { validateAdmin, validateStaffRoles } from '../../functions/user'
import { Card, CardContent, Container, Grid, ListItemIcon, ListItemButton, ListItem, ListItemText, createTheme, ThemeProvider } from '@mui/material'
import AdminUsersRoutes from './users/AdminUsersRoutes'
import AdminHome from './AdminHome'
import ItemRoutes from './items/ItemRoutes'

export const LayoutContext = createContext(null);

export default function AdminRoutes() {
    //Routes for admin pages. To add authenication so that only admins can access these pages, add a check for the user's role in the UserContext
    const { setAdminPage, user } = useContext(AppContext);
    const [containerWidth, setContainerWidth] = useState("xl");
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        setAdminPage(true)
        validateStaffRoles(["Farmer", "Admin", "FarmManager"]).then((isStaff) => {
            if (!isStaff) {
                enqueueSnackbar("You must be a staff member to view this page", { variant: "error" });
                navigate("/")
            }
        })
    }, [])

    return (
        <>
            <LayoutContext.Provider value={{ containerWidth, setContainerWidth }}>
                <Container maxWidth={containerWidth}>
                    <Routes>
                        <Route path="*" element={<NotFound />} />
                        <Route path="/" element={<AdminHome />} />
                        <Route path="/items/*" element={<ItemRoutes />} />
                        <Route path="/test" element={<Test />} />
                        <Route path="/users/*" element={<AdminUsersRoutes />} />
                    </Routes>
                </Container>
            </LayoutContext.Provider>
        </>
    )
}

