import React from "react";
import ResponsiveAppBar from "./ResponsiveAppBar";
import { Container } from "@mui/system";

function BasePage({children}) {
    return (
        <>
            <header>
                <ResponsiveAppBar></ResponsiveAppBar>
            </header>
            <main>
                <Container sx={{marginTop: "1em"}} maxWidth="lg">
                    {children}
                </Container>
            </main>
        </>
    );
}

export default BasePage;