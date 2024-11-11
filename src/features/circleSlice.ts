import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  checkCircleExists,
  createCircle,
  fetchCircleIdByName,
  fetchUserCircles,
  userJoinCircle,
  userLeaveCircle
} from "./circleThunks";

interface CircleState {
  circles: string[];
  circleExists: boolean | null;
  circleId: string | null;
  status: "idle" | "loading" | "failed";
  joinedStatus: boolean;
  description: string | null;
}

const initialState: CircleState = {
  circles: [],
  circleExists: null,
  circleId: null,
  status: "idle",
  joinedStatus: false,
  description: null,
};

const circleSlice = createSlice({
  name: "circles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCircle.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createCircle.fulfilled, (state, action) => {
        state.status = "idle";
        state.circles.push(action.payload);
      })
      .addCase(createCircle.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(fetchCircleIdByName.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCircleIdByName.fulfilled, (state, action) => {
        state.status = "idle";
        state.circleId = action.payload.id;
        state.description = action.payload.description;
        state.circleExists = true;
      })
      .addCase(fetchCircleIdByName.rejected, (state) => {
        state.status = "failed";
        state.circleExists = false;
      })
      .addCase(checkCircleExists.fulfilled, (state, action) => {
        state.circleExists = true;
        state.circleId = action.payload.id;
        state.description = action.payload.description;
      })
      .addCase(checkCircleExists.rejected, (state) => {
        state.circleExists = false;
      })
      .addCase(userJoinCircle.pending, (state) => {
        state.status = "loading";
      })
      .addCase(userJoinCircle.fulfilled, (state, action) => {
        state.status = "idle";
        state.circles.push(action.payload);
      })
      .addCase(userJoinCircle.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(userLeaveCircle.pending, (state) => {
        state.status = "loading";
      })
      .addCase(userLeaveCircle.fulfilled, (state, action) => {
        state.status = "idle";
      })
      .addCase(userLeaveCircle.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(fetchUserCircles.fulfilled, (state, action) => {
        state.circles = action.payload; // Store the circle names
      })
      .addCase(fetchUserCircles.rejected, (state) => {
        state.status = "failed"; // Handle error
      });
  },
});

export default circleSlice.reducer;
