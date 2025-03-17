document.addEventListener("DOMContentLoaded", () => {
    fetchComments(); // Load comments when page opens
    setCustomerName(); // Set the logged-in username
    // fetchAverageGrades(); // Fetch and display average ratings for items
});

function setCustomerName() {
    let loggedInUser = sessionStorage.getItem("username"); // Retrieve username from sessionStorage

    if (!loggedInUser) {
        alert("You must be logged in to leave a comment.");
        return;
    }

    document.getElementById("customerNameDisplay").textContent = loggedInUser; // Display the username
    document.getElementById("customerName").value = loggedInUser; // Set hidden input value
}

async function fetchComments() {
    try {
        let response = await fetch('/get_comments_and_grades'); // This fetches both comments and ratings (grades)

        console.log("Raw response:", response);  // Debugging step

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        let comments = await response.json(); // Assuming this returns both comments and grades data
        console.log("Parsed comments:", comments);  // Debugging step

        let container = document.getElementById("commentsContainer");
        container.innerHTML = ""; // Clear previous comments

        comments.forEach(comment => {
            let commentBox = document.createElement("div");
            commentBox.className = "comment-box";

            let colors = { "1": "Black", "2": "Blue", "3": "Green", "4": "Purple", "5": "Red", "6": "White" };
            let selectedCap = colors[comment.item_id] || "None";

            // Display the individual grade for each comment, as selected by the customer
            commentBox.innerHTML = `<strong>${comment.customer}:</strong> ${comment.text} <br>
                                    <small>${comment.created_at}</small> <br>
                                    <em>Selected Cap: ${selectedCap}</em><br>
                                    <strong>Rating: ${comment.rate}</strong>`;  // Display the rating (individual grade) for the comment

            container.appendChild(commentBox);
        });
    } catch (error) {
        console.error("Error loading comments:", error);
    }
}



function getSelectedCap() {
    let selectedCap = document.querySelector('input[name="option"]:checked');
    return selectedCap ? selectedCap.value : ""; // ✅ Returns item_id
}
//Tom------------------------------
function getSelectedRating() {
    let selectedRating = document.querySelector('input[name="rating"]:checked');
    return selectedRating ? selectedRating.value : ""; // Returns rating (1-5)
}


async function addComment() {
    let commentText = document.getElementById("commentInput").value.trim();
    let customerName = sessionStorage.getItem('username');
    let selectedItemId = getSelectedCap();  // Get selected item_id from checkbox
    let rating = getSelectedRating();  // Get selected rating (1-5)

    if (commentText === "" || selectedItemId === "" || rating === "") {
        alert("Please enter a comment, select an item, and rate it.");
        return;
    }

    try {
        // First, add the comment
        let response = await fetch('/add_or_update_comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comment: commentText,
                customer: customerName,
                item_id: selectedItemId,
                grade: rating, // Send the grade (rating)
            })
        });

        let result = await response.json();
        if (result.success) {
            // Once the comment is added successfully, update the grade
            await updateGrade(commentText, customerName, selectedItemId, rating);

            // Reload comments to reflect changes
            fetchComments();

            // Clear input and reset selections
            document.getElementById("commentInput").value = "";
            document.querySelectorAll('input[name="option"]').forEach(checkbox => checkbox.checked = false);
            document.querySelectorAll('input[name="rating"]').forEach(radio => radio.checked = false);
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}


function onlyOne(checkbox) {
    document.querySelectorAll('input[name="option"]').forEach(cb => {
        if (cb !== checkbox) cb.checked = false;
    });
}
