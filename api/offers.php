<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Path to the offers JSON file
$offersFile = '../offers.json';

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different HTTP methods
switch ($method) {
    case 'GET':
        // Read offers from JSON file
        if (file_exists($offersFile)) {
            $jsonData = file_get_contents($offersFile);
            echo $jsonData;
        } else {
            // Create default offers file if it doesn't exist
            $defaultOffers = [
                'offers' => [],
                'lastUpdated' => date('c')
            ];
            file_put_contents($offersFile, json_encode($defaultOffers, JSON_PRETTY_PRINT));
            echo json_encode($defaultOffers);
        }
        break;
        
    case 'POST':
        // Add or update offers
        $input = json_decode(file_get_contents('php://input'), true);
        
        if ($input && isset($input['offers'])) {
            $data = [
                'offers' => $input['offers'],
                'lastUpdated' => date('c')
            ];
            
            if (file_put_contents($offersFile, json_encode($data, JSON_PRETTY_PRINT))) {
                echo json_encode(['success' => true, 'message' => 'Offers updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to save offers']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid data format']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}
?>
