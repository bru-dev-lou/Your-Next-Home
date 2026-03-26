CREATE TABLE IF NOT EXISTS property_list (
    id INTEGER PRIMARY KEY,
    type TEXT NOT NULL,
    city TEXT NOT NULL,
    price INTEGER NOT NULL,
    no_bedrooms INTEGER NOT NULL,
    no_bathrooms INTEGER NOT NULL,
    size INTEGER NOT NULL,
    furniture TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT 'Seems like a description is missing for this property. Please contact the owner for more details.If you are the owner, please update the property description.',
    owner_id INTEGER NOT NULL,
    date_listed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    property_id TEXT DEFAULT 'PROP0000',
    message_topic TEXT NOT NULL,
    message TEXT NOT NULL
);
