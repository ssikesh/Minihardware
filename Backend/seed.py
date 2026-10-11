import asyncio
import os
from decimal import Decimal
from sqlalchemy import select

from app.core.config import settings
from app.core.security import get_password_hash
from app.database.database import AsyncSessionLocal, engine
from app.database.models import Cart, CartItem, Category, Product, User, UserRole


async def seed_database():
    """Seeds admin user, standard categories, and sample hardware products."""
    print("🌱 Starting database seeding for MiniHardware...")

    async with AsyncSessionLocal() as session:
        # 1. Seed Admin User
        admin_email = os.getenv("SEED_ADMIN_EMAIL", settings.SEED_ADMIN_EMAIL).lower().strip()
        admin_password = os.getenv("SEED_ADMIN_PASSWORD", settings.SEED_ADMIN_PASSWORD)
        admin_name = os.getenv("SEED_ADMIN_NAME", settings.SEED_ADMIN_NAME)

        res = await session.execute(select(User).where(User.email == admin_email))
        admin_user = res.scalar_one_or_none()

        if not admin_user:
            admin_user = User(
                name=admin_name,
                email=admin_email,
                password_hash=get_password_hash(admin_password),
                role=UserRole.ADMIN.value,
                is_active=True
            )
            session.add(admin_user)
            await session.commit()
            print(f"✅ Admin user created: {admin_email}")
        else:
            print(f"ℹ️ Admin user already exists: {admin_email}")

        # 2. Seed Categories
        categories_data = [
            {"name": "Bolts", "description": "Hex bolts, carriage bolts, flange bolts, and heavy hex screws."},
            {"name": "Nuts", "description": "Hex nuts, nylon lock nuts, wing nuts, and cap nuts."},
            {"name": "Screws", "description": "Wood screws, drywall screws, self-drilling, and machine screws."},
            {"name": "Washers", "description": "Flat washers, split lock washers, fender washers, and Belleville washers."},
            {"name": "Hinges", "description": "Door hinges, continuous piano hinges, and strap hinges."},
            {"name": "Brackets", "description": "L-brackets, corner braces, flat mending plates, and gussets."},
            {"name": "Metal Fittings", "description": "Threaded pipe fittings, couplers, adapters, and flanges."},
            {"name": "Tools", "description": "Hex keys, screwdrivers, wrenches, measuring tapes, and hand tools."}
        ]

        category_map = {}
        for cat_info in categories_data:
            res = await session.execute(
                select(Category).where(Category.name == cat_info["name"])
            )
            cat = res.scalar_one_or_none()
            if not cat:
                cat = Category(
                    name=cat_info["name"],
                    description=cat_info["description"],
                    is_active=True
                )
                session.add(cat)
                await session.commit()
                await session.refresh(cat)
                print(f"✅ Category created: {cat.name}")
            category_map[cat.name] = cat.id

        # 3. Seed Sample Products (At least 10 products with diverse stock statuses)
        products_data = [
            {
                "name": "M6 Stainless Steel Hex Bolt (30mm)",
                "description": "Grade 304 (A2-70) stainless steel hexagonal head bolt, corrosion resistant.",
                "sku": "BOLT-M6-30-SS",
                "price": Decimal("0.85"),
                "stock_quantity": 250,
                "low_stock_threshold": 25,
                "category": "Bolts",
                "image_url": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500"
            },
            {
                "name": "M8 Zinc-Plated Carriage Bolt (50mm)",
                "description": "Round dome head with square neck for timber-to-metal fastening.",
                "sku": "BOLT-M8-50-ZP",
                "price": Decimal("1.20"),
                "stock_quantity": 15,  # LOW STOCK
                "low_stock_threshold": 20,
                "category": "Bolts",
                "image_url": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500"
            },
            {
                "name": "M6 Stainless Steel Hex Nut",
                "description": "DIN 934 standard A2 stainless steel finished full hexagon nut.",
                "sku": "NUT-M6-SS",
                "price": Decimal("0.35"),
                "stock_quantity": 500,
                "low_stock_threshold": 50,
                "category": "Nuts",
                "image_url": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500"
            },
            {
                "name": "M8 Nylon Insert Lock Nut",
                "description": "Vibration resistant prevailing torque type lock nut with nylon collar.",
                "sku": "NUT-M8-NYL",
                "price": Decimal("0.50"),
                "stock_quantity": 180,
                "low_stock_threshold": 30,
                "category": "Nuts",
                "image_url": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500"
            },
            {
                "name": "#8 Phillips Flat Head Wood Screw (1-1/2 Inch)",
                "description": "Coarse thread wood screw with deep countersinking flat head, zinc plated.",
                "sku": "SCRW-WOD-8-15",
                "price": Decimal("0.18"),
                "stock_quantity": 1200,
                "low_stock_threshold": 100,
                "category": "Screws",
                "image_url": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500"
            },
            {
                "name": "M4 Pan Head Machine Screw (20mm)",
                "description": "Precision metric machine screw with Phillips cross recess.",
                "sku": "SCRW-MCH-M4-20",
                "price": Decimal("0.25"),
                "stock_quantity": 0,  # OUT OF STOCK
                "low_stock_threshold": 50,
                "category": "Screws",
                "image_url": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500"
            },
            {
                "name": "1/4-Inch Stainless Steel Flat Washer",
                "description": "Distributes fastener load smoothly over mating surfaces.",
                "sku": "WSH-FLT-025-SS",
                "price": Decimal("0.10"),
                "stock_quantity": 800,
                "low_stock_threshold": 100,
                "category": "Washers",
                "image_url": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500"
            },
            {
                "name": "M8 Split Spring Lock Washer",
                "description": "Helical spring lock washer providing high tension against loosening.",
                "sku": "WSH-SPR-M8-ZP",
                "price": Decimal("0.15"),
                "stock_quantity": 450,
                "low_stock_threshold": 50,
                "category": "Washers",
                "image_url": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500"
            },
            {
                "name": "3-Inch Stainless Steel Heavy Duty Butt Hinge",
                "description": "Solid stainless steel door hinge with smooth bearing pin for interior/exterior doors.",
                "sku": "HNG-BUTT-3SS",
                "price": Decimal("4.75"),
                "stock_quantity": 45,
                "low_stock_threshold": 10,
                "category": "Hinges",
                "image_url": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500"
            },
            {
                "name": "90-Degree Heavy Duty Corner Angle Bracket (4-Pack)",
                "description": "Reinforced steel corner angle bracket for structural shelf and timber support.",
                "sku": "BRK-CRN-90HD",
                "price": Decimal("6.50"),
                "stock_quantity": 80,
                "low_stock_threshold": 15,
                "category": "Brackets",
                "image_url": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500"
            },
            {
                "name": "1/2-Inch Threaded Solid Brass Pipe Coupler",
                "description": "Lead-free forged brass pipe fitting with female NPT threads.",
                "sku": "FIT-BRS-050-CPL",
                "price": Decimal("5.25"),
                "stock_quantity": 6,  # LOW STOCK
                "low_stock_threshold": 12,
                "category": "Metal Fittings",
                "image_url": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500"
            },
            {
                "name": "Metric Ball-End Hex Key Set (9-Piece)",
                "description": "Hardened chrome vanadium alloy steel hex wrench set (1.5mm to 10mm).",
                "sku": "TOOL-HEX-9PC",
                "price": Decimal("14.99"),
                "stock_quantity": 40,
                "low_stock_threshold": 8,
                "category": "Tools",
                "image_url": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500"
            }
        ]

        for p_info in products_data:
            res = await session.execute(
                select(Product).where(Product.sku == p_info["sku"])
            )
            prod = res.scalar_one_or_none()
            if not prod:
                prod = Product(
                    name=p_info["name"],
                    description=p_info["description"],
                    sku=p_info["sku"],
                    price=p_info["price"],
                    stock_quantity=p_info["stock_quantity"],
                    low_stock_threshold=p_info["low_stock_threshold"],
                    category_id=category_map[p_info["category"]],
                    image_url=p_info["image_url"],
                    is_active=True
                )
                session.add(prod)
                await session.commit()
                print(f"✅ Product created: {prod.name} (SKU: {prod.sku})")
            else:
                print(f"ℹ️ Product already exists: {p_info['sku']}")

    print("🎉 Seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_database())
