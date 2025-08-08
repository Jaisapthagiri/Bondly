import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    connections : [],
    pendingConnections : [],
    followers : [],
    following : []
}

const messageSlice = createSlice({
    name : 'messages',
    initialState,
    reducers:{

    }
})

export default messageSlice.reducer;