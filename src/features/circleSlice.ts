import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../auth/supabaseClient";

interface CircleState {
  circles: Array<{ name: string }>;
  circleExists: boolean;
  circleId: string | null;
  status: "idle" | "loading" | "failed";
  joinedStatus: boolean;
}

const initialState: CircleState = {
  circles: [],
  circleExists: false,
  circleId: null,
  status: "idle",
  joinedStatus: false
};

// Create Circle Action
export const createCircle = createAsyncThunk(
  "circles/createCircle",
  async ({
    name,
    description,
    created_by,
  }: {
    name: string;
    description: string;
    created_by: string;
  }) => {
    const { data, error } = await supabase
      .from("circles")
      .insert([{ name, description, created_by }])
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
);

// Check Circle Exists Action
export const checkCircleExists = createAsyncThunk(
  "circles/checkCircleExists",
  async (circleName: string) => {
    const { data, error } = await supabase
      .from("circles")
      .select("id, name")
      .eq("name", circleName)
      .single();
    if (error) throw new Error(error.message);
    return !!data;
  }
);

// Fetch CircleId by name
export const fetchCircleIdByName = createAsyncThunk(
  "circles/fetchCircleIdByName",
  async (circleName: string) => {
    const { data, error } = await supabase
      .from("circles")
      .select("id")
      .eq("name", circleName)
      .single();
    if (error) throw new Error(error.message);
    return data.id;
  }
);

export const checkUserJoinedCircle = createAsyncThunk(
  "circles/checkUserJoinedCircle",
  async ({ userId, circleId }: { userId: string; circleId: string }) => {
    const { data, error } = await supabase
      .from("user_circles")
      .select("*")
      .eq("user_id", userId)
      .eq("circle_id", circleId);

    if (error) throw new Error(error.message);
    return data.length > 0;
  }
);

export const userJoinCircle = createAsyncThunk(
  "circles/userJoinCircle",
  async ({ userId, circleId }: { userId: string; circleId: string }) => {
    const { data, error } = await supabase
      .from('user_circles')
      .insert([{ user_id: userId, circle_id: circleId }]); // Insert the join row

    if (error) throw new Error(error.message);
    return data;
  }
)

export const userLeaveCircle = createAsyncThunk(
  "circles/userLeaveCircle",
  async ({ userId, circleId }: { userId: string; circleId: string }) => {
    const { data, error } = await supabase
    .from('user_circles')
    .delete()
    .eq('user_id', userId)
    .eq('circle_id', circleId); // Remove the join row

    if (error) throw new Error(error.message);
    return data;
  });

  export const fetchUserCircles = createAsyncThunk(
    "circles/fetchUserCircles",
    async (userId: string) => {
      const { data, error } = await supabase
        .from("user_circles")
        .select("circles(name)")
        .eq("user_id", userId);
  
      if (error) throw new Error(error.message);
      
      // Extract the circle names from the data
      const circleNames = data.map((entry: any) => entry.circles.name);
      return circleNames;
    }
  );
  

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
      })
      .addCase(checkUserJoinedCircle.pending, (state) => {
        state.status = "loading";
      })
      .addCase(checkUserJoinedCircle.fulfilled, (state, action) => {
        state.status = "idle";
        state.joinedStatus = action.payload; // action.payload will be `true` or `false`
      })
      .addCase(checkUserJoinedCircle.rejected, (state) => {
        state.status = "failed";
        state.joinedStatus = false; // Set to false if there was an error
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
        state.status = 'failed'; // Handle error
      });
  },
});

export default circleSlice.reducer;
