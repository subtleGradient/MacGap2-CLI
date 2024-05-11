//
//  AppDelegate.m
//  MG
//
//  Created by Tim Debo on 5/19/14.
//  Updated by Thomas Aylott on 2024-05-11.
//
//

#import "AppDelegate.h"
#import "WindowController.h"

@implementation AppDelegate

- (void)applicationWillFinishLaunching:(NSNotification *)aNotification {
  // Insert code here to initialize your application
}

- (BOOL)applicationShouldHandleReopen:(NSApplication *)application
                    hasVisibleWindows:(BOOL)visibleWindows {
  if (!visibleWindows) {
    [self.windowController.window makeKeyAndOrderFront:nil];
  }
  return YES;
}

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
  NSURL *url = nil;

  // Parse command line arguments
  NSArray *args = [[NSProcessInfo processInfo] arguments];
  for (int i = 1; i < [args count]; i++) {
    NSString *arg = args[i];
    if ([arg isEqualToString:@"--url"] && i + 1 < [args count]) {
      NSString *urlString = args[i + 1];
    url = [NSURL URLWithString:urlString];
      i++; // Skip the next argument (URL value)
    }
  }

  // Use the URL from the command line or the default URL
  if (url) {
    self.windowController =
        [[WindowController alloc] initWithURL:[url absoluteString]];
  } else {
    self.windowController = [[WindowController alloc] initWithURL:kStartPage];
  }

  [self.windowController setWindowParams];
  [self.windowController showWindow:self];
  [[NSUserNotificationCenter defaultUserNotificationCenter] setDelegate:self];
}

- (BOOL)userNotificationCenter:(NSUserNotificationCenter *)center
     shouldPresentNotification:(NSUserNotification *)notification {
  return YES;
}
@end
