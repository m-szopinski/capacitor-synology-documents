// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorSynologyDocuments",
    platforms: [.iOS(.v13)],
    products: [
        .library(
            name: "CapacitorSynologyDocuments",
            targets: ["SynologyDocsPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main")
    ],
    targets: [
        .target(
            name: "SynologyDocsPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/SynologyDocsPlugin"),
        .testTarget(
            name: "SynologyDocsPluginTests",
            dependencies: ["SynologyDocsPlugin"],
            path: "ios/Tests/SynologyDocsPluginTests")
    ]
)