import {connectToDB} from "@/app/lib/utils";
import { Prediction } from "@/app/lib/models";

export async function POST(request) {
  try {
    await connectToDB();

    const { docs} = await request.json();

    if (!Array.isArray(docs)) {
      return new Response(
        JSON.stringify({ error: "`predictions` must be an array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const inserted = await Prediction.insertMany(docs);
    
    // 2) Count total docs
    const total = await Prediction.countDocuments();
    const maxKeep = 100;

    if (total > maxKeep) {
      // find the _id of the (total-maxKeep)th oldest doc
      const docsToDelete = await Prediction.find({})
        .sort({ createdAt: 1 })      // oldest first
        .limit(total - maxKeep)
        .select('_id')
        .lean();

      const ids = docsToDelete.map((d) => d._id);
      // delete them in bulk
      await Prediction.deleteMany({ _id: { $in: ids } });
    }

    return new Response(JSON.stringify({ insertedCount: inserted.length }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error saving predictions:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  try {
    await connectToDB();
    const all = await Prediction.find().sort({ createdAt: -1 }).limit(100);
    return new Response(JSON.stringify(all), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching predictions:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
