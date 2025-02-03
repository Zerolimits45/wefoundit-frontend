import { useContext, useEffect, useState, Suspense, useRef, useLayoutEffect } from 'react'
import { Route, Routes, Navigate, Link } from 'react-router-dom'
import { Button, Container, Divider, Typography, Box, Card, TextField, Skeleton, CardContent, CardMedia, Chip, Alert, Collapse, Grid, Stack, Grid2, useTheme, CardActions, Badge } from '@mui/material'
import { AppContext } from '../App';
import { CategoryRounded, CloseRounded, HomeRounded, InfoRounded, LoginRounded, NewReleasesRounded, NotificationAddRounded, RefreshRounded, SearchRounded, WarningRounded } from '@mui/icons-material';
import titleHelper from '../functions/helpers';
import { useSnackbar } from "notistack";
import { LoadingButton } from '@mui/lab';
import CardTitle from '../components/CardTitle';
import InfoBox from '../components/InfoBox';
import ItemDialog from '../components/ItemDialog';
import { get } from 'aws-amplify/api';


export default function ViewItems() {
    titleHelper("Search Items")
    const apiUrl = import.meta.env.VITE_API_URL;
    const bucket_url = import.meta.env.VITE_BUCKET_URL
    const [items, setItems] = useState([])
    const [category, setCategory] = useState([])
    const [loading, setLoading] = useState(false)
    const [categoryLoading, setCategoryLoading] = useState(true)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [detailsId, setDetailsId] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)

    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme()

    const handleGetItems = async () => {
        setLoading(true)
        setSelectedCategory(null)
        var itemReq = get({
            apiName: "midori",
            path: "/items?attach=true",
        })

        try {
            var res = await itemReq.response
            var data = await res.body.json()
            setItems(data)
            setLoading(false)
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Failed to load items", { variant: "error" })
            setLoading(false)
        }
    }

    const handleGetItemsByCategory = async (id) => {
        setLoading(true)
        setSelectedCategory(id)
        var itemReq = get({
            apiName: "midori",
            path: "/items?attach=true&categoryId=" + id
        })

        try {
            var res = await itemReq.response
            var data = await res.body.json()
            setItems(data)
            setLoading(false)
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Failed to load items", { variant: "error" })
            setLoading(false)
        }
    }

    const handleGetCategories = async () => {
        setCategoryLoading(true)
        var itemReq = get({
            apiName: "midori",
            path: "/categories",
        })

        try {
            var res = await itemReq.response
            var data = await res.body.json()
            setCategory(data)
            setCategoryLoading(false)
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Failed to load item categories", { variant: "error" })
            setCategoryLoading(false)
        }
    }

    const handleDetailsClose = () => {
        setDetailsDialogOpen(false)
    }

    const handleDetailsOpen = (id) => {
        setDetailsId(id)
        setDetailsDialogOpen(true)
    }


    useEffect(() => {
        handleGetItems()
        handleGetCategories()
    }, [])

    return (

        <>
            <Container maxWidth="xl">
                <Box sx={{ marginY: "1rem" }}>
                    <Box display={{ xs: "none", md: "block" }}>
                        <Box display={"flex"} alignItems="center">
                            <SearchRounded sx={{ fontSize: "3rem", color: theme.palette.primary.main, mx: "1rem" }} />
                            <Typography variant="h4" my={"2rem"} ml={"1rem"} fontWeight={700}>All Lost Items</Typography>
                        </Box>

                        <Divider sx={{ mb: "1rem" }} />
                    </Box>
                    <Stack direction="row" spacing={"0.5rem"} flexWrap={"wrap"} useFlexGap>
                        <Button variant="contained">Add Notification</Button>
                        <LoadingButton loadingPosition='start' variant="outlined" startIcon={<RefreshRounded />} onClick={handleGetItems} loading={loading}>Refresh</LoadingButton>
                    </Stack>
                    <Grid2 container spacing={2} sx={{ mt: "1rem" }}>
                        <Grid2 size={{ md: 3, xs: 12 }}>
                            <Card>
                                <CardContent>
                                    <CardTitle title="Filter By Category"/>
                                    <Box sx={{ mt: "1rem" }}>
                                        <Stack direction="row" spacing={"0.5rem"} flexWrap={"wrap"} useFlexGap>
                                            {!categoryLoading && (
                                                <Button variant={
                                                    selectedCategory === null ? "contained" : "outlined"
                                                } onClick={() => {
                                                    handleGetItems()
                                                }}>All</Button>
                                            )}
                                            {categoryLoading && (
                                                <>
                                                    <Skeleton variant="text" width={"5rem"} height={32} animation="wave" />
                                                    <Skeleton variant="text" width={"7rem"} height={32} animation="wave" />
                                                    <Skeleton variant="text" width={"6rem"} height={32} animation="wave" />
                                                    <Skeleton variant="text" width={"4rem"} height={32} animation="wave" />
                                                    <Skeleton variant="text" width={"5rem"} height={32} animation="wave" />
                                                    <Skeleton variant="text" width={"7rem"} height={32} animation="wave" />
                                                </>
                                            )}
                                            {!categoryLoading && category.map((cat, i) => (
                                                <Button variant={
                                                    selectedCategory === cat.id ? "contained" : "outlined"
                                                } key={i} onClick={() => {
                                                    handleGetItemsByCategory(cat.id)
                                                }}>{cat.name}</Button>
                                            ))}
                                        </Stack>
                                    </Box>

                                </CardContent>
                            </Card>
                        </Grid2>
                        <Grid2 size={{ md: 9, xs: 12 }}>
                            <Grid2 container spacing={2}>
                                {// If items are loading, show skeleton loaders instead of the items}
                                    loading && [1, 2, 3].map((i) => (
                                        <Grid2 size={{ lg: 4, sm: 6, xs: 12 }} key={i}>
                                            <Card sx={{ width: "100%" }}>
                                                <Skeleton variant="rectangular" height={200} animation="wave" />
                                                <CardContent>
                                                    <Stack direction="column" spacing={"0.5rem"}>
                                                        <Skeleton variant="text" width={"15rem"} height={48} animation="wave" />
                                                        <Skeleton variant="text" width={"7rem"} height={24} animation="wave" />

                                                    </Stack>
                                                    <Skeleton variant="text" width={"5rem"} height={32} sx={{ mt: "1rem" }} animation="wave" />
                                                </CardContent>
                                            </Card>
                                        </Grid2>
                                    ))}

                                {// Show all items
                                    !loading && items.map((item, i) => (
                                        <Grid2 size={{ lg: 4, sm: 6, xs: 12 }} key={i}>
                                            <Card sx={{ width: "100%" }}>
                                                <CardMedia
                                                    sx={{ height: 200, backgroundColor: "darkgrey", objectFit: "contain" }}
                                                    image={item.attachment ? bucket_url + "/items/" + item.id + "/" + item.attachment.replace(" ", "+") : "/icon.png"}
                                                    title="Background"
                                                    objectFit="contain"
                                                    component={"img"}
                                                />
                                                <CardContent>
                                                    <Typography gutterBottom variant="h6" fontWeight={700}>
                                                        {item.name}
                                                    </Typography>
                                                    <Chip label={item.categoryName} size='small' />
                                                </CardContent>
                                                <CardActions>
                                                    <Button size="medium" startIcon={<InfoRounded />} onClick={() => {
                                                        handleDetailsOpen(item.id)
                                                    }}>Item Details</Button>
                                                </CardActions>
                                            </Card>
                                        </Grid2>
                                    ))}

                                {
                                    !loading && items.length === 0 && (
                                        <Grid2 size={{ xs: 12 }}>
                                            <Stack direction={"column"} spacing={'0.5rem'} py={"2rem"} sx={{ justifyContent: "center", alignItems: "center", borderRadius: "10px", border: "1px solid lightgrey" }}>
                                                <CloseRounded sx={{ height: "32px", width: "32px", color: "grey" }} />
                                                <Typography variant="body1" color="grey">No items in this category</Typography>
                                            </Stack>
                                        </Grid2>
                                    )}
                            </Grid2>
                        </Grid2>
                    </Grid2>
                </Box>
            </Container>
            <ItemDialog open={detailsDialogOpen} onClose={handleDetailsClose} itemId={detailsId} guestMode />
        </>
    )
}