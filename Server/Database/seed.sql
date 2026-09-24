INSERT INTO property_owners (username, name, address, phone_number, email, password_hash)
VALUES
('j@mesMM','Manchester Homes', '14 Elm Grove, Manchester, M14 5QR', '07823456789', 'james.hargreaves@propertymail.co.uk', '$2b$10$coITePkGIZLKSLtqdEF3Yu9TrydLF0fXIwfsMffayuad6wNPc5tIK'),
('S@rahLL','London Lets', '32 Victoria Road, London, SW19 4BT', '07912345678', 'sarah.mitchell@londonlets.co.uk', '$2b$10$.fBNcDTD/EnAhXPsXGIgduhDyokLTJTo1k9bZmlc/8M6k262DL2oa'),
('davidMidland1','MidLand Housing', '8 Oakfield Lane, Birmingham, B15 3PW', '07734567890', 'david.thornton@midlandhousing.co.uk', '$2b$10$Mpl9.j5IQpbFRuYjgKWSqOu5u4xiWJE0BFdBg63eLxJERzERMYDFi');

INSERT INTO inquiries (name, email, property_id, message_topic, message)
VALUES
('Example User', 'exampleuser@gmail.com', 'PROP0000', 'Listing Issue', 'I am having trouble listing my property. The button does not seem to work. Please assist.');
