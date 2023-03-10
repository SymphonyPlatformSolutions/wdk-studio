package com.symphony.devsol.client;

import com.symphony.bdk.core.auth.jwt.UserClaim;
import com.symphony.bdk.core.service.user.UserService;
import com.symphony.bdk.gen.api.model.UserSearchQuery;
import com.symphony.bdk.gen.api.model.UserV2;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequiredArgsConstructor
public class SymphonyClient {
    @Value("${wdk.studio.admins:}")
    private List<Long> admins;
    private final UserService users;
    record SimpleUser(Long id, String displayName) {}
    record Profile(boolean isAdmin) {}

    @GetMapping("symphony/profile")
    public Profile getProfile(@RequestAttribute("user") UserClaim user) {
        return new Profile(admins.contains(user.getId()));
    }

    @Cacheable("user")
    @GetMapping("symphony/user/{userId}")
    public SimpleUser getSymphonyUser(@PathVariable long userId) {
        List<UserV2> userList = users.listUsersByIds(List.of(userId));
        if (userList.isEmpty()) {
            throw new ResponseStatusException(NOT_FOUND, "No such user");
        }
        UserV2 user = userList.get(0);
        return new SimpleUser(user.getId(), user.getDisplayName());
    }

    @GetMapping("symphony/user")
    public List<SimpleUser> getSymphonyUser(@RequestParam String q) {
        UserSearchQuery query = new UserSearchQuery().query(q);
        return users.searchUsers(query, true)
            .stream()
            .filter(u -> u.getDisplayName() != null)
            .sorted(Comparator.comparing(UserV2::getDisplayName))
            .limit(10)
            .map(u -> new SimpleUser(u.getId(), u.getDisplayName()))
            .toList();
    }
}
