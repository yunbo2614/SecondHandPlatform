import React from "react";
// import axios from "axios"
// import { BASE_URL } from "../constants";
// api: GET /items
import NavBar from "./NavBar";

import{
    Box,
    Grid,
    Typography,
    Pagination
} from "@mui/material"
import {mockItem} from "../mocks/ItemDetailMock";
import {useNavigate} from "react-router-dom";


const mockItems = [
    {...mockItem, id:1, sold:false},
    {...mockItem, id:2, sold:true},
    {...mockItem, id:3, sold:false},
    {...mockItem, id:4, sold:true},
    {...mockItem, id:5, sold:false},
    {...mockItem, id:6, sold:true},
    ]

function Items(props) {
    const navigate = useNavigate();

    return(
        <>
        <NavBar/>
        <Box
         sx={{

             mx:"auto",
             mt: 3,
             maxWidth: 1200,
         }}
        >
            <Grid container spacing={6} justifyContent="center">
                {mockItems.map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.id}>
                    {/*Item* card Placeholder*/}
                        <Box
                            //onClick={() => navigate(`/itemDetail/${item.id}`)}
                            onClick={() => navigate(`/item/${item.id}`)}
                            sx={{
                                cursor: "pointer",
                                "&:hover": {
                                    boxShadow: 3,
                                },
                            }}
                        >

                        <Box
                        sx={{
                            bgcolor: "#eee",
                            borderRadius: 2,
                            p:2,
                            position: "relative",
                    }}
                    >
                    {/*Sold 标签*/}
                        {item.sold && (<Box
                            sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            height: 30,
                            width: 80,
                            bgcolor: "#30d14a",
                            color: "#c50f0f",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: 12,
                            }}
                        >
                            SOLD
                        </Box>
                        )}
                    {/* 图片 */}
                        <Box
                            component="img"
                            src={item.images[0]}
                            alt={item.title}
                            sx={{
                                width:"100%",
                                height: 160,
                                objectFit: "cover",
                                borderRadius:1,
                                mb:1.5,
                            }}
                        />
                    {/* 标题 */}
                    <Typography variant="body2" fontWeight={600} noWrap>
                        {item.title}
                    </Typography>
                    {/*价格*/}
                    <Typography variant="caption" color="text.secondary">
                            ${item.price}
                    </Typography>
                </Box>
                </Box>
            </Grid>
        ))}
    </Grid>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
            <Pagination count={10} />
        </Box>
        </Box>

        </>
    );

}

export default Items;
