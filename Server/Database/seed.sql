INSERT INTO property_list (type, city, price, no_bedrooms, no_bathrooms, size, furniture, summary, owner_id)
VALUES
('Apartment', 'Manchester', 950, 2, 1, 68, 'Unfurnished', 'Modern city centre apartment', 1),
('Terraced', 'Manchester', 1200, 3, 2, 92, 'Furnished', 'Family terraced house near park', 2),
('Terraced', 'London', 2100, 3, 2, 88, 'Semi-furnished', 'Victorian terrace with good transport links', 3),
('Bungalow', 'Liverpool', 1100, 2, 1, 75, 'Unfurnished', 'Quiet bungalow in residential area', 1),
('Semi-Detached', 'Manchester', 1350, 3, 2, 105, 'Furnished', 'Spacious semi-detached home', 2),
('Apartment', 'London', 1850, 1, 1, 55, 'Semi-furnished', 'Compact apartment close to tube station', 3),
('Semi-Detached', 'Liverpool', 1250, 3, 2, 98, 'Unfurnished', 'Comfortable home with private garden', 1),
('Detached', 'Manchester', 1750, 4, 3, 140, 'Furnished', 'Large detached house ideal for families', 2),
('Detached', 'Liverpool', 1650, 4, 2, 132, 'Semi-furnished', 'Spacious property in suburban area', 3),
('Bungalow', 'Manchester', 1150, 2, 1, 80, 'Furnished', 'Bright bungalow with garden space', 1);

INSERT INTO inquiries (name, email, property_id, message_topic, message)
VALUES
('Example User', 'exampleuser@gmail.com', 'PROP0000', 'Listing Issue', 'I am having trouble listing my property. The button does not seem to work. Please assist.');
