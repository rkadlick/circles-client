import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../auth/supabaseClient";

interface CircleState {
  circles: Array<{ id: string; name: string; description: string }>;
  circleExists: boolean;
  circleId: string | null;
  status: "idle" | "loading" | "failed";
}

const initialState: CircleState = {
  circles: [],
  circleExists: false,
  circleId: null,
  status: "idle",
};

// Create Circle Action
export const createCircle = createAsyncThunk(
  "circles/createCircle",
  async ({ name, description, created_by }: { name: string; description: string; created_by: string; }) => {
    const { data, error } = await supabase.from("circles").insert([{ name, description, created_by }]).single();
    if (error) throw new Error(error.message);
    return data;
  }
);

// Check Circle Exists Action
export const checkCircleExists = createAsyncThunk(
  "circles/checkCircleExists",
  async (circleName: string) => {
    const { data, error } = await supabase.from("circles").select("id, name").eq("name", circleName).single();
    if (error) throw new Error(error.message);
    return !!data;
  }
);

// Fetch CircleId by name
export const fetchCircleIdByName = createAsyncThunk(
  "circles/fetchCircleIdByName",
  async (circleName: string) => {
    const { data, error } = await supabase.from("circles").select("id").eq("name", circleName).single();
    if (error) throw new Error(error.message);
    return data.id;
  }
);

const circleSlice = createSlice({
  name: "circles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCircle.pending, (state) => { state.status = "loading"; })
      .addCase(createCircle.fulfilled, (state, action) => {
        state.status = "idle";
        state.circles.push(action.payload);
      })
      .addCase(createCircle.rejected, (state) => { state.status = "failed"; })
      .addCase(fetchCircleIdByName.pending, (state) => { state.status = "loading"; })
      .addCase(fetchCircleIdByName.fulfilled, (state, action) => {
        state.status = "idle";
        state.circleId = action.payload;
        state.circleExists = true;
      })
      .addCase(fetchCircleIdByName.rejected, (state) => {
        state.status = "failed";
        state.circleExists = false;
      })
      .addCase(checkCircleExists.fulfilled, (state, action) => {
        state.circleExists = action.payload;
      })
      .addCase(checkCircleExists.rejected, (state) => {
        state.circleExists = false;
      });
  },
});

export default circleSlice.reducer;
