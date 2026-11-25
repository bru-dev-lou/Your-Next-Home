# Your Next Home (YNH)

YNH provides users with the ability to either rent out their own properties or rent properties from other users. V1 focuses on providing users with a clean layout and a straightforward experience.

## Features

| Name | Description |
|:-----|:------------|
| Property Search | Users can search for properties by setting a budget or using more advanced filters |
| Property Viewing | Properties can be viewed in either a summarised or detailed version |
| Inquiries | Users can send inquiries or feedback to the team through the inquiries page |
| Sign In | Users can sign in and remain signed in thanks to the use of cookies |
| Sign Up | Users can make their own account if they want to list properties |
| Favorites | If users have an account, they can favorite properties and view these in a specific page |
| Property Management | Users who have an account can create, edit and delete their own properties |
| Photo Management | Cloudinary keeps photos in its own database with URLs stored in the app's database |
| Profile Editing | Users can edit certain profile details such as name, address, phone number and email |
| Account Security | Users can change their password and delete their account provided they know their password |

## Security

| Type | Description |
|:-----|:------------|
| Validations | Frontend and backend validations across all pages |
| Hashing | Using bcrypt to hash all passwords which are stored in the database |
| Authentication | Users sign in with their credentials and stay verified through a JWT |
| Authorization | Permissions depend on whether a user is signed in and which resources they own |
| Cookies | The JWT is stored in an HttpOnly cookie, so JavaScript in the browser can't read it |

## Tech Stack

| Layer | Technologies |
|:------|:-------------|
| Frontend | HTML, CSS, JavaScript, TypeScript, React.js |
| Backend | Node.js, Express |
| Database | SQLite |
| Image Storage | Cloudinary |

## Future Improvements (V2)

The following is the most up-to-date list of potential improvements and additions to YNH V2. To keep V2's scope manageable, some ideas have been moved to a V3 list, planned for later.

### New Features

- Add a photo upload option when users register an account
- Add a photo upload option when users submit an inquiry
- Predefine inquiry page "topic" options
- Integrate Google Maps into the detailed property page so users can see where the property is located
- Add an admin page so the team can view inquiries in the app
- Add pagination on property search results (e.g. 10 per page)
- Add a progress bar for when adding new properties and property photos
- Allow photos to be dragged and dropped in property edit for better UX

### Security

- Property owners' information should be blurred for users who do not have an account
- Rate limiting needs to be added to certain areas such as password input

### Accessibility

- Full keyboard access and WAI-ARIA review now that V1 is up and running

### Code Quality

- Modularization is required across the whole app to reduce unnecessarily long files
- Repetitive state setting needs to be grouped into functions
- There is still a lot of WET code - V2 will look into reducing this
- So far testing has been done manually; V2 will include automated testing

### Known Bugs

- When users edit their profile, they can input other users' existing data
- When editing profile information, reverting to original data AFTER triggering an error is still treated as a change
- Navigation component doesn't show name changes until the page is refreshed
- When creating or deleting a property, setTimeouts are conflicting with message reset functions

## Special Thanks

This app would not have been possible to make without the use of royalty-free photos.

Thank you to the following people / websites for making your photos free to use:

1. EvaMichalkova - https://pixabay.com/users/evamichalkova-1091520/
2. Clker-Free-Vector-Images - https://pixabay.com/users/clker-free-vector-images-3736/
3. StartupStockPhotos - https://pixabay.com/users/startupstockphotos-690514/
4. Vitaly Gariev - https://www.pexels.com/@silverkblack/
5. https://www.pexels.com
6. https://www.pixabay.com/

Thank you also to Anthropic for making Claude available on a free plan, which allowed me to keep learning as I built this app. **No code** was copied and pasted from Claude, but its explanations, practice exercises and quizzes helped tremendously in my development as a programmer. 
