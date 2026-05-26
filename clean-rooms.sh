#!/bin/bash
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdWl0cmp1a2x6ZXVob2JyZHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQzMjQ2MSwiZXhwIjoyMDk1MDA4NDYxfQ.lF-q0SFx3narY4J3kAGZOPzOygwIpC0zOwQ_uoh7wBI"
URL="https://qluitrjuklzeuhobrdzq.supabase.co/rest/v1"

# Delete all bookings for rooms that start with "Luxury Cabin" or "Family Suite"
ROOMS_JSON=$(curl -s -H "apikey: $KEY" -H "Authorization: Bearer $KEY" "$URL/rooms?select=id,name")

# Find IDs of rooms to delete (containing "Luxury Cabin" or "Family Suite")
IDS_TO_DELETE=$(echo "$ROOMS_JSON" | grep -E "Luxury Cabin|Family Suite" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

for id in $IDS_TO_DELETE; do
  echo "Deleting bookings for room $id..."
  curl -s -X DELETE -H "apikey: $KEY" -H "Authorization: Bearer $KEY" "$URL/bookings?room_id=eq.$id"
  echo "Deleting room $id..."
  curl -s -X DELETE -H "apikey: $KEY" -H "Authorization: Bearer $KEY" "$URL/rooms?id=eq.$id"
done

echo "Done cleaning up dummy rooms."
