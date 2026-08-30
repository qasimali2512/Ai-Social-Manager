from app.db.supabase import supabase


def test_connection():
    response = (
        supabase
        .table("platforms")
        .select("*")
        .execute()
    )

    print("================================")
    print("Supabase connection successful!")
    print("================================")

    print(f"Platforms found: {len(response.data)}")

    for platform in response.data:
        print(f"- {platform['name']}")


if __name__ == "__main__":
    test_connection()