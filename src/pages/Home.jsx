import { useContext, useEffect, useState, Suspense, useRef, useLayoutEffect } from 'react'
import { Route, Routes, Navigate, Link } from 'react-router-dom'
import { Button, Container, Divider, Typography, Box, Card, TextField, Skeleton, CardContent, CardMedia, Chip, Alert, Collapse, Grid, Stack, Grid2, useTheme, CardActions } from '@mui/material'
import { AppContext } from '../App';
import { CategoryRounded, HomeRounded, InfoRounded, LoginRounded, NewReleasesRounded, SearchRounded, WarningRounded } from '@mui/icons-material';
import titleHelper from '../functions/helpers';
import { useSnackbar } from "notistack";
import CardTitle from '../components/CardTitle';
import { get } from 'aws-amplify/api';
import ItemDialog from '../components/ItemDialog';
import { gsap } from 'gsap';


function Home() {
    // Routes for admin pages. To add authenication so that only admins can access these pages, add a check for the user's role in the UserContext
    //const { setIsAdminPage } = useContext(UserContext);
    titleHelper("Home")
    const apiUrl = import.meta.env.VITE_API_URL;
    const [banners, setBanners] = useState({})
    const [loading, setLoading] = useState(false)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [detailsId, setDetailsId] = useState(null)
    const { enqueueSnackbar } = useSnackbar();
    const [items, setItems] = useState([])
    const theme = useTheme()
    const bucket_url = import.meta.env.VITE_BUCKET_URL


    const handleGetItems = async () => {
        setLoading(true)
        var itemReq = get({
            apiName: "midori",
            path: "/items?limit=3&attach=true",
        })

        try {
            var res = await itemReq.response
            var data = await res.body.json()
            setItems(data)
            setLoading(false)
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Failed to load items", { variant: "error" })
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
    }, [])

    const charRef1 = useRef([]);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            const tl = gsap.timeline()
            tl.from(charRef1.current, { yPercent: -100, opacity: 0, duration: 0.5, delay: 0, stagger: 0.5, ease: "bounce.out" })
        })

        return () => ctx.revert();
    }, [])



    return (
        <>
            <Box sx={{ backgroundColor: theme.palette.primary.main, py: "7rem" }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexDirection: { xs: "column-reverse", md: "row" }, }}>
                        <Box sx={{ flexGrow: 1 }}>
                        <Typography variant='h1' style={{ fontWeight: "900", color: theme.palette.primary.contrastText }}>
                            {"We Found It".split("").map((char, index) => (
                                <span key={index} ref={el => charRef1.current[index] = el} style={{ display: 'inline-block', whiteSpace: "pre"  }}>
                                    {char}
                                </span>
                            ))}
                        </Typography>
                            <Typography variant="h5" fontWeight={400} sx={{ color: theme.palette.primary.contrastText }}>Looking for something u lost?</Typography>

                            <Button variant="white" color="secondary" sx={{ mt: "1rem" }} component={Link} to="/items">See all found items</Button>
                        </Box>
                    </Box>
                </Container>
            </Box>
            <Container maxWidth="xl">
                <Typography variant="h5" my={"2rem"} fontWeight={700} sx={{ borderBottom: "3px solid " + theme.palette.primary.main, width: "fit-content" }}>Recent Items</Typography>
                <Grid2 container spacing={2} sx={{ mb: "1rem"}}>
                    {
                        loading && [1, 2, 3].map((i) => (
                            <Grid2 size={{ lg: 4, sm: 6, xs: 12 }} key={i}>
                                <Card sx={{ width: "100%" }}>
                                    <Skeleton variant="rectangular" height={200} animation="wave" />
                                    <CardContent>
                                        <Stack direction="column" spacing={"0.5rem"}>
                                            <Skeleton variant="text" width={"15rem"} height={48} animation="wave" />
                                            <Skeleton variant="text" width={"7rem"} height={24} animation="wave" />
                                            
                                        </Stack>
                                        <Skeleton variant="text" width={"5rem"} height={32} sx={{mt: "1rem"}} animation="wave" />
                                    </CardContent>
                                </Card>
                            </Grid2>
                        ))}
                    {
                        items.slice(0, 3).map((item, i) => (
                            <Grid2 size={{ lg: 4, sm: 6, xs: 12 }} key={i}>
                                <Card sx={{ width: "100%" }}>
                                    <CardMedia
                                        sx={{ height: 200, backgroundColor: "darkgrey", objectFit: "contain" }}
                                        image={item.attachment ? bucket_url + "/items/" + item.id + "/" + item.attachment.replace(" ", "+") : "/icon.png"}
                                        title="Background"
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
                    
                </Grid2>
            </Container>
            <ItemDialog open={detailsDialogOpen} onClose={handleDetailsClose} itemId={detailsId} guestMode />
        </>
    )
}


export default Home