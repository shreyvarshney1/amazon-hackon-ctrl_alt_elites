interface orderDetails {
    message : string,
    order_id : string
}

export async function placeOrder(product_id : string, quantity : number) : Promise<orderDetails> {
    const token = localStorage.getItem('auth_token');

    if (!token) {
        throw new Error("Failed to retrieve token!");
    }

    const response = fetch('/api/orders/add-order', {
        method = "POST",
        headers = {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${token}`
        },
        body = {
            'items' : [
                {
                    product_id,
                    quantity,
                }
            ]
        }
    })

    if (!response.ok) {
        throw new Error("Failed to place order!");
    }

    const orderDetails = await response.json();

    return orderDetails;
}